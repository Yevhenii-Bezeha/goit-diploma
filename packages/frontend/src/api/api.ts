import { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { removeCookie, getCookie, CookieName } from '../utils/cookieManager';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/') || false;
    const isLoginAttempt =
      isAuthEndpoint && (error.config?.url?.includes('/login') || error.config?.url?.includes('/register'));

    if (error.response?.status === 401 && !isLoginAttempt) {
      const hasFanToken = !!getCookie(CookieName.ACCESS_TOKEN_FAN);
      const hasArtistToken = !!getCookie(CookieName.ACCESS_TOKEN_ARTIST);

      if (hasFanToken) {
        removeCookie(CookieName.ACCESS_TOKEN_FAN);
      }

      if (hasArtistToken) {
        removeCookie(CookieName.ACCESS_TOKEN_ARTIST);
      }

      if (window.location.pathname.includes('/for-artists')) {
        window.location.href = '/for-artists';
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const axiosBaseQuery =
  (): BaseQueryFn<{
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    withCredentials?: boolean;
  }> =>
    async ({ url, method = 'GET', data, params, withCredentials = true }) => {
      try {
        const result = await api({
          url,
          method,
          data,
          params,
          withCredentials: withCredentials,
        });
        return { data: result.data };
      } catch (axiosError) {
        const err = axiosError as AxiosError;
        return {
          error: {
            status: err.response?.status,
            data: err.response?.data || err.message,
          },
        };
      }
    };

export default axiosBaseQuery;
