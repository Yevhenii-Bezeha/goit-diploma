import SpotifyLogoSmall from '../../../assets/icons/spotify.svg';
import { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Artist } from '../../../redux/userFan/artistsApi';
import noArtistImage from '../../../assets/image/no-artist-image.png';
import { msToTime } from '../../../utils';

interface ArtistsListProps {
  data: Artist[];
  currentPage?: number;
  startingIndex?: number;
  sortKey?: 'donated' | 'listened' | null;
  sortDirection?: 'asc' | 'desc';
  setSortKey?: (key: 'donated' | 'listened') => void;
  setSortDirection?: (dir: 'asc' | 'desc') => void;
}

export const ArtistsList = ({
  data,
  currentPage = 1,
  startingIndex = 1,
  sortKey,
  sortDirection,
  setSortKey,
  setSortDirection,
}: ArtistsListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentPage]);

  // Helper to handle sort toggling
  const handleSort = (key: 'donated' | 'listened') => {
    if (!setSortKey || !setSortDirection) return;
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Helper to show sort arrow
  const renderSortArrow = (key: 'donated' | 'listened') => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1" ref={containerRef}>
      {/* Header */}
      <div className="w-full px-3 text-[#808191] text-xs font-medium grid grid-cols-[40px_1fr_80px_80px] sm:grid-cols-[40px_1fr_80px_80px] hidden sm:grid">
        <div className="text-left">#</div>
        <div className="text-left">ARTIST</div>
        <button
          type="button"
          className="text-right focus:outline-none hover:text-white transition-colors"
          onClick={() => handleSort('donated')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          DONATED{renderSortArrow('donated')}
        </button>
        <button
          type="button"
          className="text-right focus:outline-none hover:text-white transition-colors"
          onClick={() => handleSort('listened')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          LISTENED{renderSortArrow('listened')}
        </button>
      </div>
      {/* Mobile header */}
      <div className="w-full px-3 text-[#808191] text-xs font-medium grid grid-cols-[32px_1fr] sm:hidden">
        <div className="text-left">#</div>
        <div className="text-left">ARTIST</div>
      </div>

      {/* Artists */}
      <div className="flex flex-col gap-2 w-full">
        {data.map((artist, index) => (
          <NavLink
            key={artist._id}
            to={`/artist/${artist._id}`}
            className="bg-[#120E16] text-white rounded-lg transition-all duration-200 hover:bg-[#39314b] hover:scale-[1.01] group block w-full"
          >
            {/* Desktop row */}
            <div className="hidden sm:grid items-center w-full pr-3 py-3 grid-cols-[40px_1fr_80px_80px]">
              {/* Number and Spotify logo */}
              <div className="flex flex-col items-center justify-center">
                <span className="mb-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity sm:hidden">
                  <SpotifyLogoSmall
                    width={21}
                    height={21}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(artist.external_url, '_blank', 'noopener,noreferrer');
                    }}
                  />
                </span>
                <span className="text-[#808191] text-sm font-medium text-center">{startingIndex + index}</span>
              </div>
              {/* Artist info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="rounded-[4px] sm:rounded-[2px] overflow-hidden flex-shrink-0">
                  <img
                    src={artist.image || noArtistImage}
                    alt={artist.name}
                    className="w-[60px] h-[60px] object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = noArtistImage;
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity hidden sm:inline-flex">
                      <SpotifyLogoSmall
                        width={21}
                        height={21}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(artist.external_url, '_blank', 'noopener,noreferrer');
                        }}
                      />
                    </span>
                    <span className="text-base sm:text-lg font-medium whitespace-normal break-words line-clamp-2">
                      {artist.name}
                    </span>
                  </div>
                </div>
              </div>
              {/* Donated amount */}
              <div className={`text-green-400 text-sm text-right pr-4 whitespace-nowrap ${(artist.total_money ?? 0) === 0 ? 'opacity-50' : ''}`}>
                ${artist.total_money?.toFixed(2) ?? '0.00'}
              </div>
              {/* Listened time */}
              <div className="text-[#808191] text-sm text-right pr-4 whitespace-nowrap">
                {msToTime(artist.total_time_listened)}
              </div>
            </div>
            {/* Mobile row */}
            <div className="grid sm:hidden grid-cols-[32px_1fr] items-center w-full pr-3 py-2 gap-2">
              {/* Number and Spotify logo */}
              <div className="flex flex-col items-center justify-center">
                <span className="mb-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <SpotifyLogoSmall
                    width={18}
                    height={18}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(artist.external_url, '_blank', 'noopener,noreferrer');
                    }}
                  />
                </span>
                <span className="text-[#808191] text-xs font-medium text-center">{startingIndex + index}</span>
              </div>
              {/* Artist info and stats */}
              <div className="flex items-center gap-2 min-w-0 w-full">
                <div className="rounded-[4px] overflow-hidden flex-shrink-0">
                  <img
                    src={artist.image || noArtistImage}
                    alt={artist.name}
                    className="w-[40px] h-[40px] object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = noArtistImage;
                    }}
                  />
                </div>
                <div className="flex flex-row justify-between items-center min-w-0 w-full">
                  <span className="text-sm font-medium whitespace-normal break-words line-clamp-2 text-left">
                    {artist.name}
                  </span>
                  <div className="flex flex-col items-end ml-2 min-w-[56px]">
                    <span className="text-[#808191] text-xs text-right">{msToTime(artist.total_time_listened)}</span>
                    <span className={`text-green-400 text-xs text-right ${(artist.total_money ?? 0) === 0 ? 'opacity-50' : ''}`}>
                      ${artist.total_money?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
