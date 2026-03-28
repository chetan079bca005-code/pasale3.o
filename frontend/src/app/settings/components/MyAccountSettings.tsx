import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/authStore';
import { FiUser, FiLogOut, FiCamera, FiMail, FiPhone, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { settingsApi } from '../../../utils/api';

export const MyAccountSettings: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userProfile, updateUserProfile, logout } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        photo: userProfile.photo || (null as string | null),
    });
    const [initialForm, setInitialForm] = useState({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        photo: userProfile.photo || (null as string | null),
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await settingsApi.getProfile();
                const profile = data.profile || {};
                updateUserProfile({
                    name: data.username || '',
                    email: data.email || '',
                    phone: profile.phone_no || '',
                    photo: profile.photo || null,
                    businessName: profile.business_name || '',
                });
                const nextForm = {
                    name: data.username || '',
                    phone: profile.phone_no || '',
                    email: data.email || '',
                    photo: profile.photo || null,
                };
                setForm(nextForm);
                setInitialForm(nextForm);
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [updateUserProfile]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm((prev) => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await settingsApi.updateProfile({
                username: form.name,
                email: form.email,
                phone_no: form.phone,
                business_name: userProfile.businessName,
                photo: form.photo,
            });
            updateUserProfile({
                name: form.name,
                phone: form.phone,
                email: form.email,
                photo: form.photo,
            });
            setInitialForm({ ...form });
            setSuccess(t('settings.successUpdate'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setSuccess('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm(t('settings.logoutConfirm') || 'Are you sure you want to log out?')) {
            logout();
            navigate('/');
        }
    };

    const isDirty =
        form.name !== initialForm.name ||
        form.phone !== initialForm.phone ||
        form.email !== initialForm.email ||
        form.photo !== initialForm.photo;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.sections.myAccount.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.sections.myAccount.description')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="p-6 flex flex-col items-center text-center h-full">
                        <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700 shadow-xl transition-all group-hover:ring-blue-500/30">
                                {form.photo ? (
                                    <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <FiUser className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiCamera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{form.name || 'User'}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{form.email || t('settings.sections.myAccount.noEmail')}</p>

                        <div className="w-full mt-auto space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 px-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <FiLogOut className="w-4 h-4" />
                                {t('settings.sections.myAccount.signOut')}
                            </button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('settings.sections.myAccount.profileDetails')}</h3>

                        {loading ? (
                            <p className="text-gray-500 dark:text-gray-400">{t('settings.loading')}</p>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('settings.sections.myAccount.fullName')}</label>
                                    <div className="relative">
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="pl-11 sm:pl-12 bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                                            placeholder={t('settings.sections.myAccount.enterName')}
                                        />
                                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('settings.sections.myAccount.phone')}</label>
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-24 bg-gray-100 dark:bg-gray-700 rounded-l-xl flex items-center justify-center border-y border-l border-gray-200 dark:border-gray-700 z-10">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">🇳🇵 +977</span>
                                            </div>
                                            <Input
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="pl-24 sm:pl-28 pr-12 bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl relative z-0"
                                                placeholder="98XXXXXXXX"
                                            />
                                            <FiPhone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-20" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('settings.sections.myAccount.email')}</label>
                                        <div className="relative">
                                            <Input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="pl-11 sm:pl-12 bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                                                placeholder="you@example.com"
                                            />
                                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                            {success ? (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <FiCheck className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-medium">{success}</span>
                                </div>
                            ) : (
                                <span className={`text-sm ${isDirty ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                    {isDirty ? t('settings.unsavedChanges') : t('settings.changesSaved')}
                                </span>
                            )}

                            <Button
                                onClick={handleSave}
                                disabled={isSaving || loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                            >
                                {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
