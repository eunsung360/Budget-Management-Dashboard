import { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Expense } from '../App';
import { toast } from 'sonner@2.0.3';

interface QuickExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export function QuickExpenseForm({ onSubmit, onCancel, isDarkMode }: QuickExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState<'essential' | 'flexible'>('flexible');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      toast.error('금액을 입력해주세요');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: amountNum,
      memo: memo || '지출',
      category,
      date: new Date().toISOString(),
    };

    onSubmit(expense);
    toast.success('지출이 추가되었습니다');
    setAmount('');
    setMemo('');
    onCancel();
  };

  return (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3>지출 추가</h3>
          <button
            type="button"
            onClick={onCancel}
            className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-800' : ''}`}
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <Label htmlFor="amount">금액</Label>
          <div className="relative mt-2">
            <Input
              id="amount"
              type="number"
              placeholder="15,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-right pr-12 h-12"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              autoFocus
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              원
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="memo">메모</Label>
          <Input
            id="memo"
            type="text"
            placeholder="점심식사"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="mt-2 h-12"
          />
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div>
            <Label htmlFor="category" className="cursor-pointer">
              카테고리
            </Label>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {category === 'essential' ? '필수 지출' : '선택 지출'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${category === 'flexible' ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') : ''}`}>
              선택
            </span>
            <Switch
              id="category"
              checked={category === 'essential'}
              onCheckedChange={(checked) => setCategory(checked ? 'essential' : 'flexible')}
            />
            <span className={`text-sm ${category === 'essential' ? '' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
              필수
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12"
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            추가
          </Button>
        </div>
      </form>
    </Card>
  );
}
