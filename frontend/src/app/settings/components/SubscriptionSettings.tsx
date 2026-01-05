import React from 'react';
import { useTranslation } from '../../../utils/i18n';
import { Card } from '../../../components/ui/Card';
import { FiCheck, FiStar } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';

export const SubscriptionSettings: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.sections.subscription.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.sections.subscription.description')}</p>
            </div>

            <Card className="p-8 border-2 border-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        {t('settings.sections.subscription.currentPlan')}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('settings.sections.subscription.freePlan')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('settings.sections.subscription.freePlanDesc')}</p>

                        <div className="space-y-3">
                            <p className="font-medium text-gray-900 dark:text-white uppercase tracking-wider text-xs">{t('settings.sections.subscription.featuresIncluded')}</p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <FiCheck className="w-4 h-4 text-emerald-500" />
                                    {t('settings.sections.subscription.feature1')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <FiCheck className="w-4 h-4 text-emerald-500" />
                                    {t('settings.sections.subscription.feature2')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <FiCheck className="w-4 h-4 text-emerald-500" />
                                    {t('settings.sections.subscription.feature3')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <FiCheck className="w-4 h-4 text-emerald-500" />
                                    {t('settings.sections.subscription.feature4')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">Rs. 0</span>
                            <span className="text-gray-500 dark:text-gray-400">/mo</span>
                        </div>
                        <div className="space-y-3 w-full">
                            <div className="w-full py-2 px-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium text-center">
                                {t('settings.sections.subscription.active')}
                            </div>
                            <Button
                                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20"
                                onClick={() => alert(t('settings.sections.subscription.comingSoon'))}
                            >
                                <FiStar className="w-4 h-4 mr-2" />
                                {t('settings.sections.subscription.upgrade')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
