import { useState, useEffect } from 'react';
import { CookiesModal } from '../CookiesModal/CookiesModal';
import { applyCookiePreferences, saveCookiePreferences } from '../../../utils/cookieManager';
import { CookieType, hasSetCookiePreferences } from '../../../utils/cookieTypes';

export const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const hasPreferences = hasSetCookiePreferences();

        if (!hasPreferences) {
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAllCookies = () => {
        const allPreferences = {
            [CookieType.ESSENTIAL]: true,
            [CookieType.PERFORMANCE]: true,
            [CookieType.ADVERTISING]: true,
            [CookieType.SOCIAL]: true,
            [CookieType.UNCLASSIFIED]: true,
        };

        saveCookiePreferences(allPreferences);

        applyCookiePreferences();

        setShowBanner(false);
    };

    const acceptEssentialOnly = () => {
        const essentialPreferences = {
            [CookieType.ESSENTIAL]: true,
            [CookieType.PERFORMANCE]: false,
            [CookieType.ANALYTICS]: false,
            [CookieType.ADVERTISING]: false,
            [CookieType.SOCIAL]: false,
            [CookieType.UNCLASSIFIED]: false,
        };

        saveCookiePreferences(essentialPreferences);

        applyCookiePreferences();

        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg text-gray-800 z-50">
            <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex-1 text-sm">
                    <p>
                        We use cookies to improve your experience and for analytics. You can manage your preferences at any time.
                    </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
                    >
                        Preferences
                    </button>
                    <button
                        onClick={acceptEssentialOnly}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-3 text-sm font-medium rounded"
                    >
                        Essential Only
                    </button>
                    <button
                        onClick={acceptAllCookies}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 text-sm font-medium rounded"
                    >
                        Accept All
                    </button>
                </div>

                <CookiesModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={() => {
                        setModalOpen(false);
                        setShowBanner(false);
                    }}
                />
            </div>
        </div>
    );
};
