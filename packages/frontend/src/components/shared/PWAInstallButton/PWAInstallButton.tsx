import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  onInstall?: () => void;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  showIcon = true,
  children,
  onInstall,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

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

    // For iOS Safari, always show the button (will show modal on click)
    if (iOS && safari) {
      setCanInstall(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
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
    // iOS Safari - show modal with instructions
    if (isIOS && isSafari) {
      setShowIOSModal(true);
      return;
    }

    // Standard browser - use prompt
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        onInstall?.();
      }

      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleCloseModal = () => {
    setShowIOSModal(false);
    onInstall?.();
  };

  // Don't show if app is installed or can't be installed
  if (isInstalled || !canInstall) {
    return null;
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200';
      case 'minimal':
        return 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20';
      default:
        return 'bg-purple-600 hover:bg-purple-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      >
        {showIcon && <Download size={size === 'lg' ? 20 : 16} />}
        {children || 'Install App'}
      </button>

      {/* iOS Safari Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Install StreamSupport App
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add StreamSupport to your home screen for the best experience!
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 font-medium">
                  1
                </div>
                <span>Tap the <Share className="inline w-4 h-4 mx-1" /> Share button at the bottom of your screen</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 font-medium">
                  2
                </div>
                <span>Scroll down and tap "Add to Home Screen"</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 font-medium">
                  3
                </div>
                <span>Tap "Add" to install StreamSupport on your home screen</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;
export { PWAInstallButton }; 