import React from 'react';
import {
    FiSettings,
    FiUser,
    FiBriefcase,
    FiCreditCard,
    FiChevronRight,
} from 'react-icons/fi';

export type SettingsSection = 'general' | 'my-account' | 'business-profile' | 'subscription' | 'feature-settings';

interface SettingsSidebarProps {
    activeSection: SettingsSection;
    setActiveSection: (section: SettingsSection) => void;
    isMobileOpen?: boolean;
    setIsMobileOpen?: (isOpen: boolean) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    activeSection,
    setActiveSection,
    isMobileOpen = false,
    setIsMobileOpen,
}) => {
    const menuItems = [
        { id: 'general' as SettingsSection, label: 'General', icon: FiSettings, description: 'App preferences & defaults' },
        { id: 'my-account' as SettingsSection, label: 'My Account', icon: FiUser, description: 'Profile & security' },
        { id: 'business-profile' as SettingsSection, label: 'Business Profile', icon: FiBriefcase, description: 'Company details & branding' },
        { id: 'feature-settings' as SettingsSection, label: 'Features', icon: FiSettings, description: 'Parties, Inventory, etc.' }, // Using FiSettings as placeholder or find distinct icon
        { id: 'subscription' as SettingsSection, label: 'Subscription', icon: FiCreditCard, description: 'Plan & billing' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen?.(false)}
            />

            {/* Sidebar */}
            <div className={`
        fixed lg:sticky top-18 left-0 lg:top-24 h-[calc(100vh-5rem)] lg:h-auto
        w-72 lg:w-full max-w-xs bg-white dark:bg-gray-800 lg:bg-transparent
        border-r lg:border-none border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 z-50 lg:z-0
        overflow-y-auto p-4 lg:p-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = activeSection === item.id || (item.id === 'feature-settings' && ['parties', 'inventory', 'transactions', 'invoice-print'].includes(activeSection as any));

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setIsMobileOpen?.(false);
                                }}
                                className={`w-full group flex items-center p-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-lg mr-3 transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-gray-700'
                                    }`}>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600'
                                        }`} />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-200'}`}>
                                        {item.label}
                                    </p>
                                    <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>
                                        {item.description}
                                    </p>
                                </div>
                                {isActive && <FiChevronRight className="w-4 h-4 text-white ml-2" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

