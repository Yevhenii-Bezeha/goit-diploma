import { useState } from 'react';
import { saveCookiePreferences, loadCookiePreferences } from '../../../utils/cookieManager';
import { CookieType, CookiePreferences } from '../../../utils/cookieTypes';

interface CookieOption {
    label: string;
    description: string;
    count: number;
    disabled: boolean;
    type: CookieType;
}

interface CookiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

const cookieOptions: CookieOption[] = [
    {
        label: 'Essential Cookies',
        description:
            'These cookies are necessary to the core functionality of our website and some of its features, such as access to secure areas.',
        count: 3,
        disabled: true,
        type: CookieType.ESSENTIAL,
    },
    {
        label: 'Performance and Functionality Cookies',
        description:
            'These cookies are used to enhance the performance and functionality of our websites but are nonessential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.',
        count: 3,
        disabled: false,
        type: CookieType.PERFORMANCE,
    },
    {
        label: 'Advertising Cookies',
        description:
            'These cookies are used to make advertising messages more relevant to you. They prevent the same ad from continuously reappearing, ensure that ads are properly displayed for advertisers, and in some cases select advertisements that are based on your interests.',
        count: 0,
        disabled: false,
        type: CookieType.ADVERTISING,
    },
    {
        label: 'Social networking Cookies',
        description:
            "These cookies enable you to share our website's content through third-party social networks and other websites. These cookies may also be used for advertising purposes.",
        count: 0,
        disabled: false,
        type: CookieType.SOCIAL,
    },
    {
        label: 'Unclassified Cookies',
        description:
            'These are cookies that have not yet been categorized. We are in the process of classifying these cookies with the help of their providers.',
        count: 5,
        disabled: false,
        type: CookieType.UNCLASSIFIED,
    },
];

export const CookiesModal = ({ isOpen, onClose, onSave }: CookiesModalProps) => {
    const [preferences, setPreferences] = useState<CookiePreferences>(() => loadCookiePreferences());

    const handleToggle = (type: CookieType) => {
        if (type === CookieType.ESSENTIAL) return;

        setPreferences((prev: CookiePreferences) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleSave = () => {
        saveCookiePreferences(preferences);

        onClose();

        if (onSave) {
            onSave();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Cookie Preferences</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="mb-6 text-gray-600 text-sm">
                        We use different types of cookies to optimize your experience. You may choose which types to allow. Learn
                        more in our{' '}
                        <a href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-800 font-medium">
                            Privacy Policy
                        </a>
                    </p>

                    <div className="space-y-4">
                        {cookieOptions.map((cookie, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences[cookie.type]}
                                            onChange={() => handleToggle(cookie.type)}
                                            disabled={cookie.disabled}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">
                                            {cookie.label} <span className="text-gray-500 text-xs">({cookie.count})</span>
                                        </span>
                                    </label>
                                    {cookie.disabled && (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Required</span>
                                    )}
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500 pl-6">{cookie.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
