import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css';
import { CookieName, getCookie } from './utils/cookieManager';
import { GlobalErrorBoundary } from './components/shared/ErrorBoundary/ErrorBoundary';

// Lazy loaded components
const Home = lazy(() => import('./pages/userFan/HomePage.tsx'));
const PrivateRoutesArtist = lazy(() => import('./pages/userArtist/PrivateRoutesArtist.tsx'));
const PiePage = lazy(() => import('./pages/userFan/PiePage.tsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.tsx'));
const PolicyPage = lazy(() => import('./pages/PolicyPage.tsx'));
const IndexPage = lazy(() => import('./pages/userFan/IndexPage.tsx'));
const SuccessCheckoutPage = lazy(() => import('./pages/userFan/SuccessCheckoutPage.tsx'));
const ArtistProfilePage = lazy(() => import('./pages/userArtist/ArtistProfilePage.tsx'));
const ArtistArtistsPage = lazy(() => import('./pages/userArtist/ArtistArtistsPage.tsx'));
const ArtistFundPage = lazy(() => import('./pages/userArtist/ArtistFundPage.tsx'));
const SharedLayout = lazy(() =>
  import('./components/userFan/SharedLayout/SharedLayout.tsx').then((module) => ({ default: module.SharedLayout }))
);
const CookieBanner = lazy(() =>
  import('./components/shared/CookieBanner/CookieBanner').then((module) => ({ default: module.CookieBanner }))
);
const CompleteRegistration = lazy(() => import('./pages/userArtist/CompleteRegistration'));

// Error page
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
// Fan auth pages
const FanLoginPage = lazy(() => import('./pages/userFan/LoginPage'));

// Artist auth pages
const ArtistLoginPage = lazy(() => import('./pages/userArtist/LoginPage'));
const ArtistTermsPage = lazy(() => import('./pages/ArtistTermsPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <IndexPage />
      </Suspense>
    ),
  },
  // Auth pages
  {
    path: '/login',
    errorElement: <ErrorPage title="Something went wrong" />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <FanLoginPage />
      </Suspense>
    ),
  },
  // Authenticated user routes (formerly under /app)
  {
    path: '/',
    errorElement: <ErrorPage title="Something went wrong" />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SharedLayout />
      </Suspense>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Home />,
      },
      {
        path: 'pie',
        element: <PiePage />,
      },
      {
        path: 'pie/successCheckout',
        element: <SuccessCheckoutPage />,
      },
      {
        path: '*',
        errorElement: <ErrorPage title="Something went wrong" />,
        element: <Navigate to="/" />, // fallback for unknown routes - redirect to homepage
      },
    ],
  },
  // Shared routes
  {
    path: '/error',
    errorElement: <ErrorPage title="Something went wrong" />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/terms',
    errorElement: <ErrorPage title="Something went wrong" />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <TermsPage />
      </Suspense>
    ),
  },
  {
    path: '/terms/artists',
    errorElement: <ErrorPage title="Something went wrong" />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ArtistTermsPage />
      </Suspense>
    ),
  },
  {
    path: '/privacy',
    errorElement: <ErrorPage title="Something went wrong" />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <PolicyPage />
      </Suspense>
    ),
  },


  // Artists routes
  {
    path: '/for-artists',
    errorElement: <ErrorPage title="Something went wrong" />,
    children: [
      {
        index: true,
        element: getCookie(CookieName.ACCESS_TOKEN_ARTIST) ? (
          <Navigate to="/for-artists/artists" />
        ) : (
          <Suspense fallback={<div>Loading...</div>}>
            <Navigate to="/for-artists/login" />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ArtistLoginPage />
          </Suspense>
        ),
      },
      {
        path: 'complete-registration',
        errorElement: <ErrorPage title="Something went wrong" />,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CompleteRegistration />
          </Suspense>
        ),
      },
      {
        path: '',
        errorElement: <ErrorPage title="Something went wrong" />,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PrivateRoutesArtist />
          </Suspense>
        ),
        children: [
          {
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <ArtistProfilePage />
              </Suspense>
            ),
            children: [
              {
                path: 'artists',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <ArtistArtistsPage />
                  </Suspense>
                ),
              },
              {
                path: 'funds',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <ArtistFundPage />
                  </Suspense>
                ),
              },
              {
                path: '*',
                element: <Navigate to="/for-artists" />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

const App = () => {


  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#121212]">
        <div className="content-container flex-1 overflow-x-hidden">
          <Suspense fallback={'Loading'}>
            <RouterProvider router={router} />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading cookie banner...</div>}>
          <CookieBanner />
        </Suspense>
      </div>
    </GlobalErrorBoundary>
  );
};

export default App;
