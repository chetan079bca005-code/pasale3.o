import React, { useState } from 'react';
import { useSettingsStore, BankAccount } from '../../../store/settingsStore';
import { Card } from '../../../components/ui/Card';
import { FiPlus, FiTrash2, FiEdit2, FiCheckCircle } from 'react-icons/fi';
import { BankAccountsModal } from './BankAccountsModal';

export const BankAccountsManager: React.FC = () => {
    const { businessProfile, addBankAccount, updateBankAccount, deleteBankAccount } = useSettingsStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

    const handleSave = (accountData: Omit<BankAccount, 'id'>) => {
        if (editingAccount) {
            updateBankAccount(editingAccount.id, accountData);
            setEditingAccount(null);
        } else {
            addBankAccount(accountData);
        }
    };

    const handleEdit = (account: BankAccount) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this bank account?')) {
            deleteBankAccount(id);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">Bank Accounts</label>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                    <FiPlus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {businessProfile.bankAccounts.map((account) => (
                    <div
                        key={account.id}
                        className={`p-4 rounded-xl border transition-all ${account.isPrimary
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{account.bankName}</h4>
                                    {account.isPrimary && (
                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <FiCheckCircle className="w-3 h-3" />
                                            Primary
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{account.accountNumber}</p>
                                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{account.accountHolderName}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(account)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(account.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {businessProfile.bankAccounts.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No bank accounts added yet.</p>
                    </div>
                )}
            </div>

            <BankAccountsModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSave={handleSave}
                initialData={editingAccount}
            />
        </div>
    );
};

