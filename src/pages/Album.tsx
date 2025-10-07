import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Lightbox from "@/components/Lightbox";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with real data from backend
const mockAlbumData: Record<string, any> = {
  "casamento-ana-joao": {
    title: "Casamento Ana & João",
    photos: Array.from({ length: 12 }, (_, i) => 
      `https://images.unsplash.com/photo-${1519741497674 + i * 1000}?w=800&q=80`
    ),
  },
  "formatura-medicina-2024": {
    title: "Formatura Medicina 2024",
    photos: Array.from({ length: 12 }, (_, i) => 
      `https://images.unsplash.com/photo-${1523050854058 + i * 1000}?w=800&q=80`
    ),
  },
};

const Album = () => {
  const { slug } = useParams<{ slug: string }>();
  const [albumData, setAlbumData] = useState<any>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch album data from API
    // API.get(`/albums/${slug}`).then(r => setAlbumData(r.data))
    
    // Using mock data for now
    setTimeout(() => {
      if (slug && mockAlbumData[slug]) {
        setAlbumData(mockAlbumData[slug]);
      } else {
        // Default album for demo purposes
        setAlbumData({
          title: slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "Álbum",
          photos: Array.from({ length: 9 }, (_, i) => 
            `https://images.unsplash.com/photo-${1519741497674 + i * 1000}?w=800&q=80`
          ),
        });
      }
      setLoading(false);
    }, 500);
  }, [slug]);

  const handleNext = () => {
    if (lightboxIndex !== null && albumData) {
      setLightboxIndex((lightboxIndex + 1) % albumData.photos.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null && albumData) {
      setLightboxIndex(
        lightboxIndex === 0 ? albumData.photos.length - 1 : lightboxIndex - 1
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

  if (!albumData) {
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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/galeria" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Galeria
        </Link>

        <h1 className="text-4xl md:text-5xl mb-4">{albumData.title}</h1>
        <p className="text-muted-foreground mb-12">
          {albumData.photos.length} {albumData.photos.length === 1 ? "foto" : "fotos"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albumData.photos.map((photo: string, index: number) => (
            <div
              key={index}
              className="aspect-[4/5] bg-muted rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={photo}
                alt={`${albumData.title} - Foto ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            images={albumData.photos}
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
