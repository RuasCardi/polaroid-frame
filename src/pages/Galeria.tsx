import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PolaroidCard from "@/components/PolaroidCard";

type Album = {
  id: string;
  slug: string;
  title: string;
  cover_url?: string | null;
  photo_count?: number | null;
};

const Galeria = () => {
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
        if (!isSupabaseConfigured || !supabase) {
          console.error("Supabase não configurado. Pulando carregamento de álbuns.");
          toast({
            title: "Configuração necessária",
            description: "Configure a integração com o Supabase para exibir os álbuns.",
            variant: "destructive",
          });
          setAlbums([]);
          setLoading(false);
          return;
        }
      const { data, error } = await supabase
        .from("albums")
        .select("id, slug, title, cover_url, photo_count, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar álbuns:", error);
        toast({
          title: "Erro ao carregar álbuns",
          description: error.message,
          variant: "destructive",
        });
        setAlbums([]);
      } else {
        setAlbums(data ?? []);
      }

      setLoading(false);
    };

    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Galeria de Álbuns</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore meu portfólio de eventos, ensaios e momentos especiais capturados com dedicação e arte.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Carregando álbuns...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <PolaroidCard key={album.id} album={album} />
            ))}
          </div>
        )}

        {!loading && albums.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nenhum álbum disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Galeria;
