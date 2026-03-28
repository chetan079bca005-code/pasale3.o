import React, { useState } from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { Button } from '../ui/Button';

interface AppLockScreenProps {
  isOpen: boolean;
  pin?: string | null;
  onUnlock: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ isOpen, pin, onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUnlock = () => {
    if (pin && pin.length > 0) {
      if (input !== pin) {
        setError('Invalid PIN');
        return;
      }
    }
    setError('');
    setInput('');
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4">
          <FiLock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">App Locked</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter your PIN to continue
        </p>

        <div className="mt-5">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pin ? 'Enter PIN' : 'No PIN set'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!pin}
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          {!pin && (
            <p className="text-xs text-amber-600 mt-2">
              No PIN set. Set one in Settings to enable lock protection.
            </p>
          )}
        </div>

        <Button
          onClick={handleUnlock}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FiUnlock className="w-4 h-4 mr-2" />
          Unlock
        </Button>
      </div>
    </div>
  );
};
