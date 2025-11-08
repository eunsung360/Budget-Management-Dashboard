import { useEffect } from 'react';
import { Trophy, Flame } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'streak' | 'budget';
  streak?: number;
  isDarkMode: boolean;
}

export function AchievementModal({
  isOpen,
  onClose,
  type,
  streak = 0,
  isDarkMode,
}: AchievementModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = type === 'streak' ? ['#f97316', '#ea580c', '#fb923c'] : ['#10b981', '#059669', '#34d399'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen, type]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : ''} max-w-sm`}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {type === 'streak' ? (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Flame size={48} className="text-white" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Trophy size={48} className="text-white" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center text-2xl">
            {type === 'streak' ? '🎉 연속 달성!' : '🎉 목표 달성!'}
          </DialogTitle>
          <DialogDescription className={`text-center ${isDarkMode ? 'text-gray-400' : ''}`}>
            {type === 'streak' ? (
              `${streak}일 연속 달성! 훌륭합니다! 계속해서 목표를 달성해보세요.`
            ) : (
              '월간 예산 목표를 달성했습니다! 투자와 저축을 잘 실천하고 있습니다.'
            )}
          </DialogDescription>
          {type === 'streak' && (
            <div className="text-center">
              <div className="text-orange-600 font-mono mb-2" style={{ fontSize: '32px' }}>
                {streak}일
              </div>
            </div>
          )}
        </DialogHeader>
        <Button
          onClick={onClose}
          className={`w-full h-12 ${
            type === 'streak'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          }`}
        >
          계속하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
