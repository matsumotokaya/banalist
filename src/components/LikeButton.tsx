import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserLikes, useToggleLike } from '../hooks/useLikes';

interface LikeButtonProps {
  templateId: string;
  likeCount: number;
}

export function LikeButton({ templateId, likeCount }: LikeButtonProps) {
  const { user } = useAuth();
  const { data: userLikes } = useUserLikes(user?.id);
  const { mutate: toggleLike, isPending } = useToggleLike();
  const navigate = useNavigate();
  const location = useLocation();

  const isLiked = userLikes?.includes(templateId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent(location.pathname));
      return;
    }
    if (!isPending) {
      toggleLike(templateId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 transition-all"
      disabled={isPending}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <span
        className={`material-symbols-outlined text-[18px] transition-colors ${
          isLiked ? 'text-red-500' : 'text-white/70 hover:text-white'
        }`}
        style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
      {likeCount > 0 && (
        <span className="text-xs text-white/70 font-medium tabular-nums">
          {likeCount}
        </span>
      )}
    </button>
  );
}
