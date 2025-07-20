import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App.tsx';
import './index.css';
import { store } from './store';
// const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_KEY;
const RECAPTCHA_KEY = '6LdbUNAqAAAAAA9pNoj0HECTY73EH1g_Nd_nbbhS';

// PWA Service Worker registration is now handled by Vite PWA plugin
// The plugin will automatically register the service worker and handle updates

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_KEY}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: 'head',
        }}
      >
        <App />
      </GoogleReCaptchaProvider>
    </Provider>
  </StrictMode>
);
