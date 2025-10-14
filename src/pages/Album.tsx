import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Lightbox from "@/components/Lightbox";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AlbumRecord {
  id: string;
  title: string;
  cover_url?: string | null;
  cover_storage_path?: string | null;
  photo_count?: number | null;
}

interface PhotoRecord {
  id: string;
  url: string;
}

const Album = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [album, setAlbum] = useState<AlbumRecord | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlbum = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);

      if (!isSupabaseConfigured || !supabase) {
        console.error("Supabase não configurado. Pulando carregamento do álbum.");
        toast({
          title: "Configuração necessária",
          description: "Configure a integração com o Supabase para visualizar os álbuns.",
          variant: "destructive",
        });
        setAlbum(null);
        setPhotos([]);
        setLoading(false);
        return;
      }

      const { data: albumData, error: albumError } = await supabase
        .from("albums")
  .select("id, title, cover_url, cover_storage_path, photo_count")
        .eq("slug", slug)
        .maybeSingle();

      if (albumError || !albumData) {
        if (albumError) {
          console.error("Erro ao carregar álbum:", albumError);
          toast({
            title: "Erro ao carregar álbum",
            description: albumError.message,
            variant: "destructive",
          });
        }
        setAlbum(null);
        setPhotos([]);
        setLoading(false);
        return;
      }

      setAlbum(albumData);

      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("id, url, created_at")
        .eq("album_id", albumData.id)
        .order("created_at", { ascending: true });

      if (photosError) {
        console.error("Erro ao carregar fotos do álbum:", photosError);
        toast({
          title: "Erro ao carregar fotos",
          description: photosError.message,
          variant: "destructive",
        });
        setPhotos([]);
      } else {
        setPhotos(photosData ?? []);
      }

      setLoading(false);
    };

    loadAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleNext = () => {
    if (lightboxIndex !== null && photos.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null && photos.length > 0) {
      setLightboxIndex(
        lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando álbum...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Álbum não encontrado</h2>
          <Link to="/galeria">
            <Button variant="outline">Voltar para Galeria</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = photos.map((photo) => photo.url);
  const totalPhotos = photos.length;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/galeria" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Galeria
        </Link>

        <h1 className="text-4xl md:text-5xl mb-4">{album.title}</h1>
        <p className="text-muted-foreground mb-12">
          {totalPhotos} {totalPhotos === 1 ? "foto" : "fotos"}
        </p>

        {totalPhotos === 0 ? (
          <div className="text-muted-foreground text-center py-12">
            Nenhuma foto enviada para este álbum ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="aspect-[4/5] bg-muted rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={photo.url}
                  alt={`${album.title} - Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {lightboxIndex !== null && images.length > 0 && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </div>
    </div>
  );
};

export default Album;
