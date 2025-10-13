import { useNavigate } from "react-router-dom";

interface PolaroidCardProps {
  album: {
    id: string;
    slug: string;
    title: string;
    cover_url?: string | null;
    photo_count?: number | null;
  };
}

const PolaroidCard = ({ album }: PolaroidCardProps) => {
  const navigate = useNavigate();
  const cover = album.cover_url || "/placeholder.svg";
  const photoCount = album.photo_count ?? undefined;

  return (
    <div
      className="polaroid-card"
      onClick={() => navigate(`/galeria/${album.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/galeria/${album.slug}`)}
    >
      <img src={cover} alt={album.title} loading="lazy" />
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
