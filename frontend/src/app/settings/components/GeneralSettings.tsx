import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useLanguageStore } from '../../../store/languageStore';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useSettingsStore, type Theme } from '../../../store/settingsStore';
import { useThemeStore } from '../../../store/themeStore';
import { FiCheck } from 'react-icons/fi';
import { ToggleSwitch } from './ToggleSwitch';
import { settingsApi } from '../../../utils/api';

export const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();
    const {
        general,
        updateGeneralSettings,
    } = useSettingsStore();
    const { theme, setTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const themes: { id: Theme; label: string; color: string }[] = [
        { id: 'light', label: 'Light', color: 'bg-white' },
        { id: 'classic', label: 'Classic', color: 'bg-gray-700' },
        { id: 'dark', label: 'Dark', color: 'bg-gray-900' },
    ];

    useEffect(() => {
        if (general.appearance && general.appearance !== theme) {
            setTheme(general.appearance);
        }
    }, [general.appearance, setTheme, theme]);

    useEffect(() => {
        if (general.language && general.language !== language) {
            setLanguage(general.language);
        }
    }, [general.language, language, setLanguage]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await settingsApi.update({ general });
            setSaveMsg('Saved');
            setTimeout(() => setSaveMsg(''), 2500);
        } catch (err) {
            console.error(err);
            setSaveMsg('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your application preferences and defaults.</p>
            </div>

            {/* Appearance */}
            <Card className="p-6">
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-1">Appearance</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Choose how the application looks to you.</p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {themes.map((themeOption) => (
                        <button
                            key={themeOption.id}
                            onClick={() => {
                                setTheme(themeOption.id);
                                updateGeneralSettings({ appearance: themeOption.id });
                            }}
                            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 min-w-30 ${theme === themeOption.id
                                ? 'border-blue-600 ring-2 ring-blue-600/20 scale-105'
                                : 'border-transparent bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`w-full h-24 ${themeOption.color} relative`}>
                                {/* Mini UI Preview */}
                                <div className={`absolute top-2 left-2 right-2 h-2 rounded opacity-20 ${themeOption.id === 'light' ? 'bg-black' : 'bg-white'}`} />
                                <div className={`absolute top-6 left-2 w-8 h-16 rounded opacity-20 ${themeOption.id === 'light' ? 'bg-black' : 'bg-white'}`} />
                                <div className={`absolute top-6 left-12 right-2 h-16 rounded opacity-10 ${themeOption.id === 'light' ? 'bg-black' : 'bg-white'}`} />
                            </div>
                            {theme === themeOption.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <FiCheck className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <p className={`text-center py-3 text-sm font-medium ${theme === themeOption.id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {themeOption.label}
                            </p>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Language & Currency */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Language</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Choose your preferred language.</p>
                    </div>
                    <select
                        value={general.language}
                        onChange={(e) => {
                            const newLang = e.target.value as 'en' | 'np';
                            setLanguage(newLang);
                            updateGeneralSettings({ language: newLang });
                        }}
                        className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 font-medium transition-all"
                    >
                        <option value="en">🇺🇸 English</option>
                        <option value="np">🇳🇵 नेपाली</option>
                    </select>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Currency</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Select the currency and position.</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={general.currency}
                            onChange={(e) => updateGeneralSettings({ currency: e.target.value as 'NPR' | 'INR' | 'USD' })}
                            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 font-medium transition-all"
                        >
                            <option value="NPR">NPR (Rs.)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                        <select
                            value={general.currencyPosition}
                            onChange={(e) => updateGeneralSettings({ currencyPosition: e.target.value as 'start' | 'end' })}
                            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 font-medium transition-all"
                        >
                            <option value="start">Prefix ($100)</option>
                            <option value="end">Suffix (100$)</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Date & Time */}
            <Card className="p-6">
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">Date & Time</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar Type */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Calendar Type</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Primary calendar system</p>
                        </div>
                        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            {['AD', 'BS'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => updateGeneralSettings({ calendarType: type as 'AD' | 'BS' })}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${general.calendarType === type
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Format */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Time Format</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">12h or 24h format</p>
                        </div>
                        <select
                            value={general.timeFormat}
                            onChange={(e) => updateGeneralSettings({ timeFormat: e.target.value as '12h' | '24h' })}
                            className="bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 font-medium text-right cursor-pointer"
                        >
                            <option value="12h" className="dark:bg-gray-800">12h (09:00 PM)</option>
                            <option value="24h" className="dark:bg-gray-800">24h (21:00)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Date Format</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { value: 'BS', label: 'Default (2082 Pou 17)' },
                            { value: 'YYYY-MM-DD', label: 'ISO (2026-01-01)' },
                            { value: 'DD-MM-YYYY', label: 'Local (01-01-2026)' }
                        ].map((fmt) => (
                            <button
                                key={fmt.value}
                                onClick={() => updateGeneralSettings({ dateFormat: fmt.value as any })}
                                className={`flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-medium transition-all ${general.dateFormat === fmt.value
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                                    }`}
                            >
                                {fmt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Regional & Security */}
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg pt-4">Regional & Security</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Number Formatting</h4>
                    <div className="space-y-3">
                        {[
                            { value: 'indian', label: 'South Asian', example: '10,00,000' },
                            { value: 'international', label: 'International', example: '1,000,000' }
                        ].map((fmt) => (
                            <label key={fmt.value} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="numberFormat"
                                        checked={general.numberFormat === fmt.value}
                                        onChange={() => updateGeneralSettings({ numberFormat: fmt.value as any })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{fmt.label}</span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{fmt.example}</span>
                            </label>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <ToggleSwitch
                        enabled={general.privacyMode}
                        onChange={(val) => updateGeneralSettings({ privacyMode: val })}
                        label="Privacy Mode"
                        description="Hide sensitive business stats from dashboard"
                    />
                    <ToggleSwitch
                        enabled={general.appLock}
                        onChange={(val) => updateGeneralSettings({ appLock: val })}
                        label="App Lock"
                        description="Require authentication to access app"
                    />
                    {general.appLock && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">App Lock PIN</label>
                            <Input
                                type="password"
                                value={general.appLockPin || ''}
                                onChange={(e) => updateGeneralSettings({ appLockPin: e.target.value })}
                                className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                                placeholder="Set a PIN"
                            />
                        </div>
                    )}
                </Card>
            </div>

            <div className="flex items-center justify-end">
                {saveMsg && <span className="text-sm text-gray-500 mr-3">{saveMsg}</span>}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </div>
    );
};

