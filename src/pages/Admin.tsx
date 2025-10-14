import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { isEmailWhitelistedAdmin } from "@/constants/admin";

type AlbumRecord = {
  id: string;
  title: string;
  slug: string;
  cover_url?: string | null;
  cover_storage_path?: string | null;
  photo_count?: number | null;
  created_at?: string | null;
};

type PhotoRecord = {
  id: string;
  url: string;
  storage_path: string;
  album_id: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<AlbumRecord[]>([]);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [newAlbumCover, setNewAlbumCover] = useState<File | null>(null);
  const [newAlbumPhotos, setNewAlbumPhotos] = useState<File[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Record<string, PhotoRecord[]>>({});

  const loadAlbums = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Configuração necessária",
        description: "Supabase não configurado",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar álbuns",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAlbums(data || []);
  }, [toast]);

  const loadPhotos = useCallback(async (albumId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase
      .from("photos")
      .select("id, url, storage_path, album_id")
      .eq("album_id", albumId);
    if (!error && data) {
      setPhotos((prev) => ({ ...prev, [albumId]: data }));
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Configuração necessária",
        description: "Configure a integração com o Supabase",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _role: "admin",
        _user_id: user.id,
      });

      const isWhitelisted = isEmailWhitelistedAdmin(user.email);

      if (roleError) {
        console.error("Erro ao verificar permissões:", roleError);
        if (!isWhitelisted) {
          toast({
            title: "Erro de permissão",
            description: "Não foi possível confirmar seu acesso",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
      }

      if (!isAdmin && !isWhitelisted) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadAlbums();
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [toast, navigate, loadAlbums]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  useEffect(() => {
    albums.forEach((album) => loadPhotos(album.id));
  }, [albums, loadPhotos]);

  const createAlbum = async () => {
    if (!newAlbumTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título",
        variant: "destructive",
      });
      return;
    }
    if (!newAlbumCover) {
      toast({
        title: "Capa obrigatória",
        description: "Selecione uma imagem de capa",
        variant: "destructive",
      });
      return;
    }
    setCreating(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase não configurado");
      }
      const slug = newAlbumTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      // Criar álbum
      const { data, error } = await supabase
        .from("albums")
        .insert({ title: newAlbumTitle, slug })
        .select("id, slug")
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Não foi possível criar o álbum.");
      
      // Upload da capa
      const fileExt = newAlbumCover.name.split(".").pop();
      const fileName = `cover.${fileExt}`;
      const filePath = `${data.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("album-photos")
        .upload(filePath, newAlbumCover);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("album-photos")
        .getPublicUrl(filePath);
      
      console.log("✅ CAPA CRIADA:", {
        albumId: data.id,
        filePath,
        publicUrl,
        fileName,
      });
      
      // Atualizar referência da capa no álbum
      const { error: coverError } = await supabase
        .from("albums")
        .update({ cover_url: publicUrl, cover_storage_path: filePath })
        .eq("id", data.id);
      
      if (coverError) throw coverError;
      
      console.log("✅ ÁLBUM ATUALIZADO COM CAPA:", {
        albumId: data.id,
        cover_url: publicUrl,
        cover_storage_path: filePath,
      });
      
      // Upload das fotos adicionais (se houver)
      if (newAlbumPhotos.length > 0) {
        let uploadedCount = 0;
        
        for (const file of newAlbumPhotos) {
          const photoExt = file.name.split(".").pop();
          const photoName = `${Math.random().toString(36).substring(2)}.${photoExt}`;
          const photoPath = `${data.id}/${photoName}`;
          
          const { error: photoUploadError } = await supabase.storage
            .from("album-photos")
            .upload(photoPath, file);
          
          if (photoUploadError) {
            console.error("Erro ao fazer upload de foto:", photoUploadError);
            continue;
          }
          
          const { data: { publicUrl: photoUrl } } = supabase.storage
            .from("album-photos")
            .getPublicUrl(photoPath);
          
          const { error: photoInsertError } = await supabase
            .from("photos")
            .insert({ album_id: data.id, url: photoUrl, storage_path: photoPath });
          
          if (photoInsertError) {
            console.error("Erro ao salvar foto no banco:", photoInsertError);
            continue;
          }
          
          uploadedCount++;
        }
        
        // Atualizar contagem de fotos
        const { error: countError } = await supabase
          .from("albums")
          .update({ photo_count: uploadedCount })
          .eq("id", data.id);
        
        if (countError) {
          console.error("Erro ao atualizar contagem:", countError);
        }
        
        toast({
          title: "Álbum criado!",
          description: `Álbum criado com ${uploadedCount} foto(s)`,
        });
      } else {
        toast({
          title: "Álbum criado!",
          description: "Álbum criado com a capa. Você pode adicionar mais fotos depois.",
        });
      }
      
      setNewAlbumTitle("");
      setNewAlbumCover(null);
      setNewAlbumPhotos([]);
      await loadAlbums();
    } catch (error) {
      console.error("Erro ao criar álbum:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar álbum",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteAlbum = async (albumId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!confirm("Tem certeza que deseja excluir este álbum?")) return;

    try {
      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", albumId);

      if (error) throw error;

      toast({
        title: "Álbum excluído",
        description: "O álbum foi removido",
      });

      await loadAlbums();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir álbum",
        description: message,
        variant: "destructive",
      });
    }
  };

  const uploadPhotos = async (event: ChangeEvent<HTMLInputElement>, albumId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setSelectedAlbum(albumId);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase não configurado");
      }

      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${albumId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("album-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("album-photos")
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from("photos")
          .insert({
            album_id: albumId,
            storage_path: filePath,
            url: publicUrl,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Fotos enviadas!",
        description: `${files.length} foto(s) adicionada(s)`,
      });

      await loadAlbums();
      await loadPhotos(albumId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao enviar fotos",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedAlbum(null);
    }
  };

  const deletePhoto = async (photoId: string, storagePath: string, albumId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!confirm("Tem certeza que deseja excluir esta foto?")) return;
    
    try {
      const { error: storageError } = await supabase.storage
        .from("album-photos")
        .remove([storagePath]);
      
      if (storageError) throw storageError;
      
      const { error: dbError } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);
      
      if (dbError) throw dbError;
      
      toast({ 
        title: "Foto excluída", 
        description: "A foto foi removida" 
      });
      
      await loadPhotos(albumId);
      await loadAlbums();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir foto",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Painel Admin</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Voltar ao site
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Criar Novo Álbum</CardTitle>
            <CardDescription>
              Adicione um novo álbum ao seu portfólio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do álbum"
                  value={newAlbumTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setNewAlbumTitle(event.target.value)}
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      createAlbum();
                    }
                  }}
                  className="max-w-md"
                />
                <Button onClick={createAlbum} disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Álbum
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewAlbumCover(e.target.files?.[0] || null)}
                    className="hidden"
                    id="album-cover"
                  />
                  <label htmlFor="album-cover">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Capa
                      </span>
                    </Button>
                  </label>
                  {newAlbumCover && (
                    <p className="text-sm text-green-600">
                      ✓ {newAlbumCover.name}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewAlbumPhotos(Array.from(e.target.files || []))}
                    className="hidden"
                    id="album-photos"
                  />
                  <label htmlFor="album-photos">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Fotos do Álbum (opcional)
                      </span>
                    </Button>
                  </label>
                  {newAlbumPhotos.length > 0 && (
                    <p className="text-sm text-green-600">
                      ✓ {newAlbumPhotos.length} foto(s) selecionada(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {albums.map((album) => (
            <Card key={album.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{album.title}</CardTitle>
                    <CardDescription>
                      {(album.photo_count ?? 0)} foto(s) • Criado em{" "}
                      {album.created_at
                        ? new Date(album.created_at).toLocaleDateString("pt-BR")
                        : "data indisponível"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteAlbum(album.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(event) => uploadPhotos(event, album.id)}
                      disabled={uploading && selectedAlbum === album.id}
                      className="hidden"
                      id={`upload-${album.id}`}
                    />
                    <Button
                      variant="secondary"
                      disabled={uploading && selectedAlbum === album.id}
                      onClick={() => document.getElementById(`upload-${album.id}`)?.click()}
                      className="w-full"
                    >
                      {uploading && selectedAlbum === album.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Enviando fotos...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar Fotos ao Álbum
                        </>
                      )}
                    </Button>
                  </div>
                  {photos[album.id] && photos[album.id].length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {photos[album.id].map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img 
                            src={photo.url} 
                            alt="foto" 
                            className="w-24 h-24 object-cover rounded" 
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Excluir foto"
                            onClick={() => deletePhoto(photo.id, photo.storage_path, album.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {albums.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum álbum criado ainda. Crie seu primeiro álbum acima!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
