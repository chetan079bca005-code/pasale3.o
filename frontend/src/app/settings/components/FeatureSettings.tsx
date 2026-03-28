import React, { useState } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { Card } from '../../../components/ui/Card';
import { useSettingsStore } from '../../../store/settingsStore';
import { ToggleSwitch } from './ToggleSwitch';
import { FiUsers, FiPackage, FiPrinter, FiDollarSign } from 'react-icons/fi';
import { settingsApi } from '../../../utils/api';

export const FeatureSettings: React.FC = () => {
    const { t } = useTranslation();
    const {
        featureSettings,
        updatePartySettings,
        updateInventorySettings,
        updateTransactionSettings,
        updateInvoicePrintSettings
    } = useSettingsStore();
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const {
        parties: partySettings,
        inventory: inventorySettings,
        transactions: transactionSettings,
        invoicePrint: invoicePrintSettings
    } = featureSettings;

    const handleSave = async () => {
        try {
            setSaving(true);
            await settingsApi.update({ feature_settings: featureSettings });
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
        <>
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.sections.features.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.sections.features.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parties Module */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <FiUsers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.sections.features.parties')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.sections.features.partiesDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ToggleSwitch
                            label={t('settings.sections.features.partyCategories')}
                            enabled={partySettings.partyCategory}
                            onChange={(checked) => updatePartySettings({ partyCategory: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.partyImages')}
                            enabled={partySettings.uploadPartyImage}
                            onChange={(checked) => updatePartySettings({ uploadPartyImage: checked })}
                        />
                    </div>
                </Card>

                {/* Inventory Module */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            <FiPackage className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.sections.features.inventory')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.sections.features.inventoryDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ToggleSwitch
                            label={t('settings.sections.features.showBarcode')}
                            enabled={inventorySettings.enableBarcode}
                            onChange={(checked) => updateInventorySettings({ enableBarcode: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.showSku')}
                            enabled={inventorySettings.enableSKU}
                            onChange={(checked) => updateInventorySettings({ enableSKU: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.lowStockAlerts')}
                            enabled={inventorySettings.lowStockAlert}
                            onChange={(checked) => updateInventorySettings({ lowStockAlert: checked })}
                        />
                    </div>
                </Card>

                {/* Transactions */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                            <FiDollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.sections.features.transactions')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.sections.features.transactionsDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ToggleSwitch
                            label={t('settings.sections.features.autoInvoice')}
                            enabled={transactionSettings.autoGenerateInvoiceNumber}
                            onChange={(checked) => updateTransactionSettings({ autoGenerateInvoiceNumber: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.paymentReminders')}
                            enabled={transactionSettings.enablePaymentReminders}
                            onChange={(checked) => updateTransactionSettings({ enablePaymentReminders: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.digitalSignature')}
                            enabled={transactionSettings.showSignature}
                            onChange={(checked) => updateTransactionSettings({ showSignature: checked })}
                        />
                    </div>
                </Card>

                {/* Invoice Print Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                            <FiPrinter className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.sections.features.invoicePrint')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.sections.features.invoicePrintDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.sections.features.paperSize')}</label>
                            <select
                                value={invoicePrintSettings.paperSize}
                                onChange={(e) => updateInvoicePrintSettings({ paperSize: e.target.value as 'A4' | 'A5' | 'thermal' })}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="A4">A4 (Standard)</option>
                                <option value="A5">A5 (Half)</option>
                                <option value="thermal">Thermal (POS)</option>
                            </select>
                        </div>
                        <ToggleSwitch
                            label={t('settings.sections.features.showLogo')}
                            enabled={invoicePrintSettings.showLogo}
                            onChange={(checked) => updateInvoicePrintSettings({ showLogo: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.showBusinessDetails')}
                            enabled={invoicePrintSettings.showBusinessDetails}
                            onChange={(checked) => updateInvoicePrintSettings({ showBusinessDetails: checked })}
                        />
                        <ToggleSwitch
                            label={t('settings.sections.features.showPaymentInfo')}
                            enabled={invoicePrintSettings.showPaymentInfo}
                            onChange={(checked) => updateInvoicePrintSettings({ showPaymentInfo: checked })}
                        />
                    </div>
                </Card>
            </div>
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
        </>
    );
};

