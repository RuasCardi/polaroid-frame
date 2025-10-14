import { useEffect, useMemo, useState } from "react";
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

const PolaroidCard = ({ album }: PolaroidCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
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

  useEffect(() => {
    setImageError(false);
    console.log("🖼️ URL da capa resolvida:", resolvedCoverUrl);
  }, [resolvedCoverUrl]);

  const cover = !imageError && resolvedCoverUrl ? resolvedCoverUrl : "/placeholder.svg";

  console.log("📸 PolaroidCard renderizando:", {
    albumTitle: album.title,
    coverUsado: cover,
    temErro: imageError,
  });

  return (
    <div
      className="polaroid-card"
      onClick={() => navigate(`/galeria/${album.slug}`)}
      role="button"
      tabIndex={0}
    >
      <img
        src={cover}
        alt={album.title}
        loading="lazy"
        onError={() => {
          console.error("Erro ao carregar imagem da capa: exibindo placeholder", album.id, {
            resolvedCoverUrl,
            cover_storage_path: album.cover_storage_path,
            cover_url: album.cover_url,
          });
          setImageError(true);
        }}
      />
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
