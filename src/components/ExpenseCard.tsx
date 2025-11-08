import { useState } from 'react';
import { Trash2, ShoppingBag, Home } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Expense } from '../App';
import { motion } from 'motion/react';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

export function ExpenseCard({ expense, onDelete, isDarkMode }: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(expense.id);
    }, 300);
  };

  const date = new Date(expense.date);
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
  const formattedTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 1, x: 0 }}
      animate={isDeleting ? { opacity: 0, x: -100 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-full ${
              expense.category === 'essential' 
                ? isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                : isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'
            }`}>
              {expense.category === 'essential' ? (
                <Home className={expense.category === 'essential' ? 'text-blue-600' : 'text-purple-600'} size={20} />
              ) : (
                <ShoppingBag className="text-purple-600" size={20} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {expense.memo}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  expense.category === 'essential' 
                    ? isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                    : isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  {expense.category === 'essential' ? '필수' : '선택'}
                </span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formattedDate} {formattedTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-3">
            <p className="font-mono" style={{ fontSize: '18px' }}>
              ₩{expense.amount.toLocaleString()}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
