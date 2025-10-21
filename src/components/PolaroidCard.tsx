import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

interface PolaroidCardProps {
  album: {
    id: string;
    slug: string;
    title: string;
    cover_url?: string | null;
    cover_storage_path?: string | null;
    photo_count?: number | null;
  };
}

interface AlbumPhoto {
  url: string;
  storage_path: string;
}

const PolaroidCard = ({ album }: PolaroidCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoCount = album.photo_count ?? undefined;

  const resolvedCoverUrl = useMemo(() => {
    console.log("🔍 PolaroidCard - Resolvendo capa para álbum:", {
      albumId: album.id,
      title: album.title,
      cover_storage_path: album.cover_storage_path,
      cover_url: album.cover_url,
    });

    if (!isSupabaseConfigured || !supabase) {
      console.warn("⚠️ Supabase não configurado, usando cover_url direto");
      return album.cover_url ?? null;
    }

    // Prioridade 1: usar cover_storage_path
    if (album.cover_storage_path) {
      const { data } = supabase.storage
        .from("album-photos")
        .getPublicUrl(album.cover_storage_path);
      
      console.log("✅ URL gerada via cover_storage_path:", data?.publicUrl);
      
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }

    // Prioridade 2: usar cover_url
    if (album.cover_url) {
      // Se já é uma URL completa, usar diretamente
      if (album.cover_url.startsWith("http")) {
        console.log("✅ Usando cover_url HTTP direto:", album.cover_url);
        return album.cover_url;
      }

      // Se parece ser um caminho de storage, gerar URL pública
      const { data } = supabase.storage
        .from("album-photos")
        .getPublicUrl(album.cover_url);
      
      console.log("✅ URL gerada via cover_url:", data?.publicUrl);
      
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }

    console.warn("❌ Nenhuma URL de capa resolvida para álbum:", album.title);
    return null;
  }, [album.cover_storage_path, album.cover_url, album.id, album.title]);

  // Buscar fotos do álbum para rotação
  const loadAlbumPhotos = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("photos")
        .select("url, storage_path")
        .eq("album_id", album.id)
        .limit(5); // Carregar até 5 fotos para rotação

      if (error) {
        console.error("Erro ao carregar fotos do álbum:", error);
        return;
      }

      if (data && data.length > 0) {
        setAlbumPhotos(data);
        console.log(`🎠 ${data.length} fotos carregadas para rotação do álbum:`, album.title);
      }
    } catch (err) {
      console.error("Erro inesperado ao carregar fotos:", err);
    }
  }, [album.id, album.title]);

  useEffect(() => {
    loadAlbumPhotos();
  }, [loadAlbumPhotos]);

  // Rotacionar fotos a cada 3 segundos
  useEffect(() => {
    if (albumPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % albumPhotos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [albumPhotos.length]);

  useEffect(() => {
    setImageError(false);
    console.log("🖼️ URL da capa resolvida:", resolvedCoverUrl);
  }, [resolvedCoverUrl]);

  // Usar foto do carousel se disponível, senão usar capa padrão
  const getPhotoUrl = (photo: AlbumPhoto) => {
    if (!isSupabaseConfigured || !supabase) return photo.url;

    if (photo.storage_path) {
      const { data } = supabase.storage
        .from("album-photos")
        .getPublicUrl(photo.storage_path);
      return data?.publicUrl || photo.url;
    }

    return photo.url;
  };

  const cover = useMemo(() => {
    // Se tem fotos carregadas, usar a foto atual do carousel
    if (albumPhotos.length > 0 && !imageError) {
      return getPhotoUrl(albumPhotos[currentPhotoIndex]);
    }

    // Caso contrário, usar a capa original ou placeholder
    return !imageError && resolvedCoverUrl ? resolvedCoverUrl : "/placeholder.svg";
  }, [albumPhotos, currentPhotoIndex, imageError, resolvedCoverUrl]);

  console.log("📸 PolaroidCard renderizando:", {
    albumTitle: album.title,
    coverUsado: cover,
    temErro: imageError,
    fotosCarregadas: albumPhotos.length,
    indiceAtual: currentPhotoIndex,
  });

  return (
    <div
      className="polaroid-card relative"
      onClick={() => navigate(`/galeria/${album.slug}`)}
      role="button"
      tabIndex={0}
    >
      <div className="relative overflow-hidden">
        <img
          src={cover}
          alt={album.title}
          loading="lazy"
          className="transition-opacity duration-500"
          onError={() => {
            console.error("Erro ao carregar imagem da capa: exibindo placeholder", album.id, {
              resolvedCoverUrl,
              cover_storage_path: album.cover_storage_path,
              cover_url: album.cover_url,
            });
            setImageError(true);
          }}
        />
        
        {/* Indicador de carousel - mostra apenas se tem múltiplas fotos */}
        {albumPhotos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {albumPhotos.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentPhotoIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="polaroid-title">{album.title}</div>
      {photoCount !== undefined && (
        <div className="text-center text-sm text-muted-foreground mt-1">
          {photoCount} {photoCount === 1 ? "foto" : "fotos"}
        </div>
      )}
    </div>
  );
};

export default PolaroidCard;
