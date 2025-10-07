import PolaroidCard from "@/components/PolaroidCard";
import { useEffect, useState } from "react";

// Mock data - will be replaced with real data from backend
const mockAlbums = [
  {
    id: "1",
    slug: "casamento-ana-joao",
    title: "Casamento Ana & João",
    coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    photoCount: 87,
  },
  {
    id: "2",
    slug: "formatura-medicina-2024",
    title: "Formatura Medicina 2024",
    coverUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600",
    photoCount: 124,
  },
  {
    id: "3",
    slug: "ensaio-gestante-maria",
    title: "Ensaio Gestante - Maria",
    coverUrl: "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600",
    photoCount: 45,
  },
  {
    id: "4",
    slug: "aniversario-15-anos-julia",
    title: "15 Anos - Julia",
    coverUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
    photoCount: 63,
  },
  {
    id: "5",
    slug: "ensaio-familia-santos",
    title: "Família Santos",
    coverUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600",
    photoCount: 38,
  },
  {
    id: "6",
    slug: "casamento-pedro-laura",
    title: "Casamento Pedro & Laura",
    coverUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
    photoCount: 95,
  },
];

const Galeria = () => {
  const [albums, setAlbums] = useState(mockAlbums);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch albums from API
    // API.get('/albums').then(r => setAlbums(r.data))
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
