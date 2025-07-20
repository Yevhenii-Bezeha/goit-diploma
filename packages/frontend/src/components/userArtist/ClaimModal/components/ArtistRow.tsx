import { ArtistSearchResult } from '../../../../redux/userArtist/userArtistApi';
import SpotifyLogoSmall from '../../../../assets/icons/spotify.svg';
import noArtistImage from '../../../../assets/image/no-artist-image.png';

type ArtistRowProps = {
  artist: ArtistSearchResult;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (artistId: string) => void;
};

export const ArtistRow = ({ artist, showCheckbox = false, isSelected = false, onSelect }: ArtistRowProps) => {
  return (
    <div
      className={`flex items-center p-4 bg-gray-700 rounded-lg border transition-colors ${showCheckbox ? 'hover:bg-gray-600 cursor-pointer border-gray-600' : 'border-gray-600'
        } ${isSelected ? 'border-blue-500 bg-blue-900/20' : ''}`}
      onClick={() => showCheckbox && onSelect?.(artist._id)}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect?.(artist._id)}
          className="mr-4 w-4 h-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
        />
      )}

      <div className="flex-shrink-0 mr-4">
        <img
          src={artist.image || noArtistImage}
          alt={artist.name}
          className="w-12 h-12 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.src = noArtistImage;
          }}
        />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {artist.external_url && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(artist.external_url, '_blank', 'noopener,noreferrer');
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-600 rounded transition-colors"
            >
              <SpotifyLogoSmall width={16} height={16} />
            </button>
          )}
          <span className="text-white font-medium truncate">{artist.name}</span>
        </div>
        <div className={`text-sm ${artist.is_claimed ? 'text-green-400' : 'text-gray-400'}`}>
          {artist.is_claimed ? 'Already claimed' : 'Available to claim'}
        </div>
      </div>

      {artist.amount !== undefined && (
        <div className="text-green-400 text-sm font-medium flex-shrink-0">
          ${artist.amount}
        </div>
      )}
    </div>
  );
};
