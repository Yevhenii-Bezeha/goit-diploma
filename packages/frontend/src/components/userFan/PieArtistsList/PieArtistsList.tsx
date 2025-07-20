import SpotifyLogoSmall from '../../../assets/icons/spotify.svg';
import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { ArtistPieData } from '../../../redux/userFan';
import { msToTime } from '../../../utils';

interface PieArtistsListProps {
  data: ArtistPieData[];
  currentPage: number;
  showMoney?: boolean;
  isExcludedTab?: boolean;
  pieSettingsPopularity?: number;
  onAddToPie?: (artistId: string) => void;
  onRemoveFromPie?: (artistId: string) => void;
  onRemoveFromAllPies?: (artistId: string) => void;
}

export const PieArtistsList = ({
  data,
  currentPage,
  showMoney = true,
  isExcludedTab = false,
  pieSettingsPopularity = 0,
  onAddToPie,
  onRemoveFromPie,
  onRemoveFromAllPies,
}: PieArtistsListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1" ref={containerRef}>
      {/* Simple Header */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/5 mb-3">
        <div className="grid grid-cols-[40px_1fr_auto_auto_auto] gap-3 px-3 py-2">
          <div className="text-white/50 text-xs font-medium">#</div>
          <div className="text-white/50 text-xs font-medium">Artist</div>
          {showMoney && <div className="text-white/50 text-xs font-medium text-right">Support</div>}
          <div className="text-white/50 text-xs font-medium text-right">Tracks</div>
          <div className="text-white/50 text-xs font-medium text-right">Actions</div>
        </div>
      </div>

      {/* Artists List */}
      <div className="flex flex-col gap-1 px-3">
        {data.map((artist, index) => (
          <div
            key={`${artist.pie_artist_id}-${artist.artist_id}`}
            className="group bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
          >
            <div className="grid grid-cols-[40px_1fr_auto_auto_auto] gap-3 p-3 items-center">
              {/* Rank */}
              <div className="flex items-center justify-center">
                <span className="text-white/70 text-sm font-medium">
                  {(currentPage - 1) * data.length + index + 1}
                </span>
              </div>

              {/* Artist Info */}
              <NavLink className="min-w-0" to={`/artist/${artist.artist_id}`}>
                <div className="flex items-center gap-2 min-w-0 group">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-md overflow-hidden">
                      <img
                        src={artist.artist_image}
                        alt={artist.artist_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-black/60 rounded-full flex items-center justify-center">
                      <SpotifyLogoSmall
                        width={8}
                        height={8}
                        className="cursor-pointer opacity-70"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(artist.artist_external_url, '_blank');
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-white text-sm font-medium truncate">
                        {artist.artist_name}
                      </span>
                    </div>
                    <div className="text-white/50 text-xs truncate">
                      {artist.total_tracks_listened} tracks • {msToTime(artist.total_time_listened)}
                    </div>
                  </div>
                </div>
              </NavLink>

              {/* Support Amount */}
              {showMoney && (
                <div className="text-right">
                  <div className="text-green-400 text-sm font-medium">
                    ${artist.money || '0.00'}
                  </div>
                  <div className="text-white/40 text-xs">
                    {artist.percentage || '0%'}
                  </div>
                </div>
              )}

              {/* Tracks Count */}
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {artist.total_tracks_listened}
                </div>
                <div className="text-white/40 text-xs">
                  {msToTime(artist.total_time_listened)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 justify-end">
                {isExcludedTab ? (
                  <button
                    onClick={() => onAddToPie?.(artist.pie_artist_id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors"
                    title="Add to support"
                  >
                    +
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onRemoveFromPie?.(artist.pie_artist_id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors"
                      title="Remove from pie"
                    >
                      ×
                    </button>
                    <button
                      onClick={() => onRemoveFromAllPies?.(artist.artist_id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors"
                      title="Ban artist"
                    >
                      ⚠
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
