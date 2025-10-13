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
  photo_count?: number | null;
  created_at?: string | null;
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<AlbumRecord[]>([]);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const loadAlbums = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Configuração necessária",
        description: "Supabase não configurado. Não foi possível carregar os álbuns.",
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

  const checkAdmin = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Configuração necessária",
        description: "Configure a integração com o Supabase antes de acessar o painel admin.",
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
        console.error("Erro ao verificar permissões de administrador:", roleError);
        if (!isWhitelisted) {
          toast({
            title: "Erro de permissão",
            description: "Não foi possível confirmar seu acesso de administrador.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        toast({
          title: "Acesso liberado",
          description: "Não foi possível confirmar seu papel, mas seu email está autorizado.",
        });
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

  const createAlbum = async () => {
    if (!newAlbumTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o álbum",
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

      const { data, error } = await supabase
        .from("albums")
        .insert({ title: newAlbumTitle, slug })
        .select("id, slug")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Não foi possível criar o álbum.");

      toast({
        title: "Álbum criado!",
        description: "Agora você pode adicionar fotos",
      });

      setNewAlbumTitle("");
      await loadAlbums();
      navigate(`/galeria/${data.slug}`);
    } catch (error) {
      console.error("Erro ao criar álbum:", error);
      const message = error instanceof Error ? error.message : "Verifique sua conexão e tente novamente";
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
    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Configuração necessária",
        description: "Supabase não configurado. Não foi possível excluir o álbum.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este álbum? Todas as fotos serão removidas.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", albumId);

      if (error) throw error;

      toast({
        title: "Álbum excluído",
        description: "O álbum e suas fotos foram removidos",
      });

      await loadAlbums();
    } catch (error) {
      console.error("Erro ao excluir álbum:", error);
      const message = error instanceof Error ? error.message : "Verifique sua conexão e tente novamente";
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

      const albumRecord = albums.find((item) => item.id === albumId);
      let firstUploadedUrl: string | null = null;

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

        if (!firstUploadedUrl) {
          firstUploadedUrl = publicUrl;
        }
      }

      if (!albumRecord?.cover_url && firstUploadedUrl) {
        const { error: coverError } = await supabase
          .from("albums")
          .update({ cover_url: firstUploadedUrl })
          .eq("id", albumId);

        if (coverError) throw coverError;
      }

      toast({
        title: "Fotos enviadas!",
        description: `${files.length} foto(s) adicionada(s) ao álbum`,
      });

      await loadAlbums();
    } catch (error) {
      console.error("Erro ao enviar fotos:", error);
      const message = error instanceof Error ? error.message : "Verifique sua conexão e tente novamente";
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
            <div className="flex gap-2">
              <Input
                placeholder="Nome do álbum (ex: Casamento Maria & João)"
                value={newAlbumTitle}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setNewAlbumTitle(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    createAlbum();
                  }
                }}
              />
              <Button onClick={createAlbum} disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar
                  </>
                )}
              </Button>
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
                <div className="flex gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => uploadPhotos(event, album.id)}
                    disabled={uploading && selectedAlbum === album.id}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    disabled={uploading && selectedAlbum === album.id}
                  >
                    {uploading && selectedAlbum === album.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
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
