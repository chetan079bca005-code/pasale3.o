import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { SettingsSidebar, type SettingsSection } from './components/SettingsSidebar';
import { GeneralSettings } from './components/GeneralSettings';
import { MyAccountSettings } from './components/MyAccountSettings';
import { BusinessProfileSettings } from './components/BusinessProfileSettings';
import { FeatureSettings } from './components/FeatureSettings';
import { SubscriptionSettings } from './components/SubscriptionSettings';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'my-account':
        return <MyAccountSettings />;
      case 'business-profile':
        return <BusinessProfileSettings />;
      case 'feature-settings':
        return <FeatureSettings />;
      case 'subscription':
        return <SubscriptionSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
          {/* Mobile Header for Sidebar Toggle */}
          <div className="lg:hidden p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-16 z-30">
            <span className="font-semibold text-gray-900 dark:text-white">Settings</span>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 lg:shrink-0">
            <div className="sticky top-24 p-4 lg:py-8 lg:px-6">
              <SettingsSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
