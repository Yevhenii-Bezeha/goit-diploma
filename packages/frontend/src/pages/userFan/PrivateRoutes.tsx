import { Navigate, Outlet } from 'react-router-dom';
import { getCookie } from '../../utils/cookieManager';
import { CookieName } from '../../utils/cookieManager';

const PrivateRoutes = () => {
  const isAuth = getCookie(CookieName.ACCESS_TOKEN_FAN);
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
