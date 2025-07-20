import { useField } from 'formik';
import { Search } from '../../../shared/Search';
import { NavLink } from 'react-router-dom';
import { ArtistSearchResult } from '../../../../redux/userArtist/userArtistApi';
import { ArtistRow } from './ArtistRow';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { trackButtonClick, ButtonClickEvents } from '../../../../utils/analytics';

type ArtistSearchProps = {
  searchResults: ArtistSearchResult[] | undefined;
  isFetching: boolean;
  onSearch: (searchTerm: string) => void;
};

export const ArtistSearch = ({ searchResults, isFetching, onSearch }: ArtistSearchProps) => {
  const [searchField, , searchHelpers] = useField('searchTerm');
  const [selectedField, , selectedHelpers] = useField('selectedArtist');
  const [, , selectedArtistDataHelpers] = useField('selectedArtistData');
  const [debouncedSearch] = useDebouncedValue(searchField.value, 500);
  const previousSearchRef = useRef('');
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use debounced value to trigger search
  useEffect(() => {
    if (debouncedSearch?.trim()) {
      // Only trigger search if the term has changed
      if (debouncedSearch.trim() !== previousSearchRef.current) {
        previousSearchRef.current = debouncedSearch.trim();
        onSearch(debouncedSearch.trim());
      }
    }
  }, [debouncedSearch, onSearch]);

  // Show delayed message after 2 seconds of loading
  useEffect(() => {
    if (isFetching) {
      // Set a timer to show the delayed message after 2 seconds
      timerRef.current = setTimeout(() => {
        setShowDelayedMessage(true);
      }, 2000);
    } else {
      // Clear timer and hide message when not fetching
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowDelayedMessage(false);
    }

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isFetching]);

  const handleArtistSelect = (artistId: string) => {
    const newSelectedArtist = selectedField.value === artistId ? null : artistId;
    selectedHelpers.setValue(newSelectedArtist);

    if (newSelectedArtist && searchResults) {
      const selectedArtistData = searchResults.find((artist) => artist._id === artistId);
      selectedArtistDataHelpers.setValue(selectedArtistData || null);

      trackButtonClick(ButtonClickEvents.SELECT_ARTIST_IN_CLAIM_MODAL, 'claim_modal');
    } else {
      selectedArtistDataHelpers.setValue(null);
    }
  };

  const hasSearched = searchResults !== undefined;

  return (
    <>
      <div className="mb-6">
        <Search
          id="claim-modal"
          value={searchField.value}
          onChange={(value) => searchHelpers.setValue(value)}
          placeholder="Search for your artist..."
          className="w-full"
        />
      </div>

      {isFetching ? (
        <div className="flex flex-col justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          {showDelayedMessage && (
            <p className="text-gray-400 text-sm text-center">
              Searching Spotify. Please wait while we load artist data...
            </p>
          )}
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="space-y-3 mb-6">
          {searchResults.map((artist: ArtistSearchResult) => (
            <ArtistRow
              key={artist._id}
              artist={artist}
              showCheckbox={true}
              isSelected={selectedField.value === artist._id}
              onSelect={handleArtistSelect}
            />
          ))}
        </div>
      ) : (
        hasSearched && (
          <div className="text-center text-gray-400 mb-6 h-24 flex items-center justify-center">
            <p className="text-sm">No artists found</p>
          </div>
        )
      )}

      <div className="text-center text-sm text-gray-400">
        <span>Can't find your artist? </span>
        <NavLink
          className="text-blue-400 hover:text-blue-300 underline"
          target="_blank"
          to="https://app.termly.io/notify/cd5350ec-e580-4de7-a61b-fbe8fa59fae8"
        >
          Contact support
        </NavLink>
      </div>
    </>
  );
};
