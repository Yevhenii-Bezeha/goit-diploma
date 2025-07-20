import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = '',
  onInstall,
  onDismiss,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect iOS and Safari
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsSafari(safari);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = iOS && (window.navigator as any).standalone;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // For iOS Safari, show manual install instructions
    if (iOS && safari) {
      setShowPrompt(true);
      return;
    }

    // For other browsers, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        onInstall?.();
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  // Don't show if app is installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // iOS Safari manual installation instructions
  if (isIOS && isSafari && showPrompt) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 mx-auto max-w-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Install StreamSupport App
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Add StreamSupport to your home screen for the best experience!
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 font-medium text-xs">
                    1
                  </div>
                  <span>Tap the <Share className="inline w-4 h-4 mx-1" /> Share button below</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 font-medium text-xs">
                    2
                  </div>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 font-medium text-xs">
                    3
                  </div>
                  <span>Tap "Add" to install StreamSupport</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard browser installation prompt - restore original logic
  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 mx-auto max-w-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Install StreamSupport
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Add StreamSupport to your home screen for quick access to support your favorite artists!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 