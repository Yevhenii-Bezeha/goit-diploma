import classnames from 'classnames';
import Avatar from 'react-avatar';
import logo from '../../../assets/image/avatar.png';
import classes from './ArtistAvatar.module.css';
import { useGetUserArtistQuery } from '../../../redux/userArtist';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type ArtistAvatarProps = {
  className?: string;
  src?: string;
};

export const ArtistAvatar = ({ className = '{Artist name}', src = logo }: ArtistAvatarProps) => {
  const { data: { first_name, last_name, _id, user_name, email, image_url } = {} } = useGetUserArtistQuery();
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    Cookies.remove('mypie_access_token_artist');
    window.location.reload();
  };

  useEffect(() => {
    setImageError(false);
  }, [image_url]);

  const displayName = first_name && last_name ? `${first_name} ${last_name}` : user_name || 'Artist';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={classnames(classes.container, className)}>
      <style>{`
        .grecaptcha-badge {
          visibility: hidden !important;
        }
      `}</style>

      <div className="flex items-center">
        {image_url && !imageError ? (
          <img
            src={image_url}
            alt="artist avatar"
            width="32"
            height="32"
            className={classes.image}
            onError={handleImageError}
          />
        ) : src !== logo && src ? (
          <img
            src={src}
            alt="artist avatar"
            width="32"
            height="32"
            className={classes.image}
            onError={handleImageError}
          />
        ) : displayName ? (
          <Avatar
            name={displayName}
            size="32"
            round={true}
            textSizeRatio={2}
            color="#8B5CF6"
            className={classes.image}
          />
        ) : (
          <img
            src={logo}
            alt="default logo"
            width="32"
            height="32"
            className={classes.image}
            onError={handleImageError}
          />
        )}
        <span className={'text-xs ml-2 text-white'}>{displayName}</span>
      </div>


      <button
        onClick={handleLogout}
        className="p-1 text-violet-200 hover:text-red-400 transition-colors"
        title="Sign out"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
};
