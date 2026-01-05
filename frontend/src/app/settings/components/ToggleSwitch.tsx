import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (val: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    enabled,
    onChange,
    label,
    description,
    disabled = false,
}) => {
    return (
        <div className={`flex items-center justify-between py-3 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/30'}`}>
            <div className="flex-1 pr-4">
                <p className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">{label}</p>
                {description && <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => !disabled && onChange(!enabled)}
                disabled={disabled}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
};
