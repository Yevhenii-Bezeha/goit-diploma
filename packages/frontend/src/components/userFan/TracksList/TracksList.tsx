import SpotifyLogoSmall from '../../../assets/icons/spotify.svg';
import { useEffect, useRef } from 'react';
import { Track } from '../../../redux/userFan';
import { msToTime, formatPlayedAt } from '../../../utils';


interface TracksListProps {
  data: Track[];
  currentPage: number;
  isArtistDetails?: boolean;
  hideListenCount?: boolean;
}

export const TracksList = ({ data, currentPage, isArtistDetails, hideListenCount = false }: TracksListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCount = data[0]?.count !== undefined && !hideListenCount;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1" ref={containerRef}>
      {/* Header */}
      <div
        className={`grid w-full px-3 text-[#808191] text-xs font-medium ${hideListenCount ? 'grid-cols-[40px_1fr_60px] md:grid-cols-[40px_2fr_1fr_120px]' : 'grid-cols-[40px_1fr_60px_80px] md:grid-cols-[40px_2fr_1fr_120px_100px]'}`}
      >
        <div className="text-left">#</div>
        <div className="text-left">TITLE</div>
        <div className="text-left hidden md:block">ALBUM</div>
        {!hideListenCount && <div className="text-right">{hasCount && !isArtistDetails ? 'PLAYS' : 'PLAYED'}</div>}
        <div className="text-right">DURATION</div>
      </div>

      {/* Tracks */}
      <div className="flex flex-col gap-2 w-full">
        {data.map((track, index) => (
          <a
            key={track._id}
            href={track.external_url}
            onClick={() => { }}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#120E16] text-white rounded-lg transition-all duration-200 hover:bg-[#39314b] hover:scale-[1.01] group block w-full"
          >
            <div
              className={`grid items-center w-full pr-3 py-3 ${hideListenCount ? 'grid-cols-[40px_1fr_60px] md:grid-cols-[40px_2fr_1fr_120px]' : 'grid-cols-[40px_1fr_60px_80px] md:grid-cols-[40px_2fr_1fr_120px_100px]'}`}
            >
              {/* Track number and Spotify logo (mobile) */}
              <div className="flex flex-col items-center justify-center">
                {/* Mobile: logo above number */}
                <span className="mb-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity sm:hidden">
                  <SpotifyLogoSmall width={21} height={21} />
                </span>
                <span className="text-[#808191] text-sm font-medium text-center">
                  {(currentPage - 1) * data.length + index + 1}
                </span>
              </div>

              {/* Track info - simplified for mobile */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="rounded-[4px] sm:rounded-[2px] overflow-hidden flex-shrink-0 bg-[#39314b]">
                  {track.image && (
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-[45px] h-[45px] sm:w-[60px] sm:h-[60px] object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {/* Desktop: logo next to name */}
                    <span className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity hidden sm:inline-flex">
                      <SpotifyLogoSmall width={21} height={21} />
                    </span>
                    <span className="text-sm sm:text-base font-medium truncate">{track.name}</span>
                  </div>
                  <span className="text-[#808191] text-xs sm:text-sm truncate">
                    {track.artists.map((artist) => artist.name).join(', ')}
                  </span>
                </div>
              </div>

              {/* Album - hidden on mobile */}
              <div className="text-[#808191] text-sm truncate hidden md:block">{track.album_name || '-'}</div>

              {/* Play count or played at date - visible on both mobile and desktop */}
              {!hideListenCount && (
                <div className="text-[#808191] text-xs sm:text-sm text-right whitespace-nowrap">
                  {track.count !== undefined ? (
                    <span className="font-medium text-white">{track.count}</span>
                  ) : (
                    track?.played_at && <span className="hidden md:inline">{formatPlayedAt(track?.played_at)}</span>
                  )}
                </div>
              )}

              {/* Duration */}
              <div className="text-[#808191] text-xs pr-4 sm:text-sm font-medium text-right whitespace-nowrap">
                {msToTime(track.duration)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
