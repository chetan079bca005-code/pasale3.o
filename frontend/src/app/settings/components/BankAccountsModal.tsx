import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FiX } from 'react-icons/fi';
import { BankAccount } from '../../../store/settingsStore';

interface BankAccountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: Omit<BankAccount, 'id'>) => void;
    initialData?: BankAccount | null;
}

export const BankAccountsModal: React.FC<BankAccountsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [form, setForm] = useState({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        branch: '',
        isPrimary: false,
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                bankName: initialData.bankName,
                accountNumber: initialData.accountNumber,
                accountHolderName: initialData.accountHolderName,
                branch: initialData.branch || '',
                isPrimary: initialData.isPrimary,
            });
        } else {
            setForm({
                bankName: '',
                accountNumber: '',
                accountHolderName: '',
                branch: '',
                isPrimary: false,
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Bank Account' : 'Add Bank Account'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bank Name</label>
                        <Input
                            value={form.bankName}
                            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                            placeholder="e.g. NIC Asia Bank"
                            required
                            className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Number</label>
                        <Input
                            value={form.accountNumber}
                            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                            placeholder="Enter account number"
                            required
                            className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Holder Name</label>
                        <Input
                            value={form.accountHolderName}
                            onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                            placeholder="Name as in bank account"
                            required
                            className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Branch (Optional)</label>
                        <Input
                            value={form.branch}
                            onChange={(e) => setForm({ ...form, branch: e.target.value })}
                            placeholder="Branch location"
                            className="bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <input
                            type="checkbox"
                            id="isPrimary"
                            checked={form.isPrimary}
                            onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                            Set as Primary Account
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-xl py-2.5 font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold shadow-lg shadow-blue-600/20"
                        >
                            Save Account
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

