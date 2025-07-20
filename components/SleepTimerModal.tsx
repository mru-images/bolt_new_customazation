import React, { useState } from 'react';
import { X, Moon, Clock, Music } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTimer: (minutes: number | 'after-song') => void;
  currentTimer?: number | 'after-song' | null;
}

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  onSetTimer,
  currentTimer
}) => {
  const { isDarkMode } = useTheme();
  const [selectedOption, setSelectedOption] = useState<number | 'after-song' | null>(null);

  if (!isOpen) return null;

  const timeOptions = [5, 10, 15, 30, 45, 60];

  const handleSetTimer = () => {
    if (selectedOption !== null) {
      onSetTimer(selectedOption);
      onClose();
    }
  };

  const handleCancelTimer = () => {
    onSetTimer(null as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Moon className="mr-2 text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">Sleep Timer</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {currentTimer && (
          <div className={`mb-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Current timer: {typeof currentTimer === 'number' ? `${currentTimer} minutes` : 'After current song'}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {/* After current song option */}
          <button
            onClick={() => setSelectedOption('after-song')}
            className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors ${
              selectedOption === 'after-song'
                ? 'border-purple-500 bg-purple-500/10'
                : isDarkMode
                ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Music className="mr-3 text-purple-400" size={20} />
            <span className="font-medium">After current song</span>
          </button>

          {/* Time options */}
          <div className="grid grid-cols-2 gap-3">
            {timeOptions.map((minutes) => (
              <button
                key={minutes}
                onClick={() => setSelectedOption(minutes)}
                className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  selectedOption === minutes
                    ? 'border-purple-500 bg-purple-500/10'
                    : isDarkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Clock className="mr-2 text-purple-400" size={16} />
                <span className="font-medium">{minutes} min</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          {currentTimer && (
            <button
              onClick={handleCancelTimer}
              className={`flex-1 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-3 rounded-lg font-medium transition-colors`}
            >
              Cancel Timer
            </button>
          )}
          <button
            onClick={handleSetTimer}
            disabled={selectedOption === null}
            className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepTimerModal;