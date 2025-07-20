import { Navigate, Outlet } from 'react-router-dom';
import { getCookie, CookieName } from '../../utils/cookieManager';

const PrivateRoutesArtist = () => {
  const isAuth = getCookie(CookieName.ACCESS_TOKEN_ARTIST);
  return isAuth ? <Outlet /> : <Navigate to="/for-artists" />;
};

export default PrivateRoutesArtist;
