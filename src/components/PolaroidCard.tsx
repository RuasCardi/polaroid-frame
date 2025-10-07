import { useNavigate } from "react-router-dom";

interface PolaroidCardProps {
  album: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string;
    photoCount?: number;
  };
}

const PolaroidCard = ({ album }: PolaroidCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="polaroid-card"
      onClick={() => navigate(`/galeria/${album.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/galeria/${album.slug}`)}
    >
      <img src={album.coverUrl} alt={album.title} loading="lazy" />
      <div className="polaroid-title">{album.title}</div>
      {album.photoCount !== undefined && (
        <div className="text-center text-sm text-muted-foreground mt-1">
          {album.photoCount} {album.photoCount === 1 ? "foto" : "fotos"}
        </div>
      )}
    </div>
  );
};

export default PolaroidCard;
