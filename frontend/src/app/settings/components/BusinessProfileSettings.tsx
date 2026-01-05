import React, { useState, useRef } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useSettingsStore } from '../../../store/settingsStore';
import { FiBriefcase, FiX, FiChevronDown, FiChevronRight, FiFileText, FiArchive, FiTrash2, FiCheck } from 'react-icons/fi';
import { BankAccountsManager } from './BankAccountsManager';

// Nepal Location Data
const provinces = [
    'Koshi Province',
    'Madhesh Province',
    'Bagmati Province',
    'Gandaki Province',
    'Lumbini Province',
    'Karnali Province',
    'Sudurpashchim Province',
];

const districtsByProvince: Record<string, string[]> = {
    'Koshi Province': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
    'Madhesh Province': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
    'Bagmati Province': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
    'Gandaki Province': ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
    'Lumbini Province': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Nawalparasi West', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'],
    'Karnali Province': ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum West', 'Salyan', 'Surkhet'],
    'Sudurpashchim Province': ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'],
};

const businessCategories = ['Retail', 'Wholesale', 'Manufacturing', 'Services', 'Food & Beverage', 'Clothing', 'Electronics', 'Pharmacy', 'Hardware', 'Grocery', 'Other'];
const businessTypes = ['Retailer', 'Wholesaler', 'Manufacturer', 'Distributor', 'Service Provider'];

export const BusinessProfileSettings: React.FC = () => {
    const { t } = useTranslation();
    const { businessProfile, updateBusinessProfile } = useSettingsStore();
    const [dangerExpanded, setDangerExpanded] = useState(false);
    const [success, setSuccess] = useState('');
    const businessLogoRef = useRef<HTMLInputElement>(null);

    // We maintain local state for form to avoid excessive store updates, 
    // but for this example efficiently syncing with store is fine or a save button approach.
    // Given the previous design had a "Save" button, let's stick to local state + Save.

    const [form, setForm] = useState({ ...businessProfile });

    const handleSave = () => {
        updateBusinessProfile(form);
        setSuccess(t('settings.successUpdate'));
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, businessLogo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.sections.businessProfile.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.sections.businessProfile.description')}</p>
            </div>

            <Card className="p-6">
                {/* Basic Information */}
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">{t('settings.sections.businessProfile.businessInfo')}</h3>

                <div className="flex flex-col-reverse md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.businessName')}</label>
                            <Input
                                value={form.businessName}
                                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                                className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.contactNumber')}</label>
                                <Input
                                    value={form.businessContactNumber}
                                    onChange={(e) => setForm({ ...form, businessContactNumber: e.target.value })}
                                    className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.email')}</label>
                                <Input
                                    value={form.businessEmail}
                                    onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                                    className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.category')}</label>
                                <select
                                    value={form.businessCategory}
                                    onChange={(e) => setForm({ ...form, businessCategory: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{t('settings.sections.businessProfile.selectCategory')}</option>
                                    {businessCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.businessType')}</label>
                                <select
                                    value={form.businessType}
                                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{t('settings.sections.businessProfile.selectType')}</option>
                                    {businessTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Logo Section */}
                    <div className="flex flex-col items-center">
                        <div
                            onClick={() => businessLogoRef.current?.click()}
                            className="w-32 h-32 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden relative group"
                        >
                            {form.businessLogo ? (
                                <img src={form.businessLogo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center p-2">
                                    <FiBriefcase className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                    <span className="text-xs text-gray-500">{t('settings.sections.businessProfile.uploadLogo')}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium">{t('settings.sections.businessProfile.change')}</span>
                            </div>
                        </div>
                        <input ref={businessLogoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </div>
                </div>

                {/* Address */}
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 pt-8 mt-4 border-t border-gray-100 dark:border-gray-700">{t('settings.sections.businessProfile.addressDetails')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.province')}</label>
                        <select
                            value={form.province}
                            onChange={(e) => setForm({ ...form, province: e.target.value, district: '', municipality: '' })}
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t('settings.sections.businessProfile.selectProvince')}</option>
                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.district')}</label>
                        <select
                            value={form.district}
                            onChange={(e) => setForm({ ...form, district: e.target.value })}
                            disabled={!form.province}
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <option value="">{t('settings.sections.businessProfile.selectDistrict')}</option>
                            {form.province && districtsByProvince[form.province]?.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.municipality')}</label>
                        <Input
                            value={form.municipality}
                            onChange={(e) => setForm({ ...form, municipality: e.target.value })}
                            className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.streetAddress')}</label>
                        <Input
                            value={form.streetAddress}
                            onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                            className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>
                </div>

                {/* Financial */}
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6 pt-8 border-t border-gray-100 dark:border-gray-700">{t('settings.sections.businessProfile.financialInfo')}</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5">{t('settings.sections.businessProfile.regNumber')}</label>
                        <Input
                            value={form.registrationNumber}
                            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                            className="max-w-md bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <BankAccountsManager />
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                    {success ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <FiCheck className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    ) : <div />}

                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                        {t('settings.saveChanges')}
                    </Button>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 pt-6 border-t border-red-100 dark:border-red-900/30">
                    <button
                        onClick={() => setDangerExpanded(!dangerExpanded)}
                        className="flex items-center justify-between w-full text-left group"
                    >
                        <span className="text-red-600 font-bold flex items-center gap-2">
                            <FiX className="w-5 h-5" />
                            {t('settings.sections.businessProfile.dangerZone')}
                        </span>
                        {dangerExpanded ? <FiChevronDown className="w-5 h-5 text-gray-400" /> : <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    {dangerExpanded && (
                        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="border border-red-100 dark:border-red-900/30 rounded-xl divide-y divide-red-100 dark:divide-red-900/30 overflow-hidden">
                                <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left bg-white dark:bg-transparent">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                                        <FiFileText className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">{t('settings.sections.businessProfile.closeFiscalYear')}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('settings.sections.businessProfile.closeFiscalYearDesc')}</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left bg-white dark:bg-transparent">
                                    <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center shrink-0">
                                        <FiArchive className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">{t('settings.sections.businessProfile.archiveProfile')}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('settings.sections.businessProfile.archiveProfileDesc')}</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left bg-white dark:bg-transparent">
                                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center shrink-0">
                                        <FiTrash2 className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-red-600 font-medium">{t('settings.sections.businessProfile.deleteProfile')}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('settings.sections.businessProfile.deleteProfileDesc')}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
