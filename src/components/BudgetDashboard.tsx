import { useState } from 'react';
import { Plus, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { QuickExpenseForm } from './QuickExpenseForm';
import { ExpenseCard } from './ExpenseCard';
import { BudgetConfig, Expense } from '../App';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface BudgetDashboardProps {
  budgetConfig: BudgetConfig;
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  isDarkMode: boolean;
}

export function BudgetDashboard({
  budgetConfig,
  expenses,
  onAddExpense,
  onDeleteExpense,
  isDarkMode,
}: BudgetDashboardProps) {
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExceededAlert, setShowExceededAlert] = useState(false);

  const totalBudget = (budgetConfig.monthlyIncome * budgetConfig.consumptionRatio) / 100;
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const percentageUsed = (totalSpent / totalBudget) * 100;

  const getColorClass = () => {
    if (remaining < 0) return 'text-red-500';
    if (percentageUsed >= 90) return 'text-red-500';
    if (percentageUsed >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = () => {
    if (remaining < 0) return 'bg-red-500';
    if (percentageUsed >= 90) return 'bg-red-500';
    if (percentageUsed >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const recentExpenses = expenses.slice(0, 5);

  const handleAddExpense = (expense: Expense) => {
    const newRemaining = remaining - expense.amount;
    onAddExpense(expense);
    
    if (newRemaining < 0) {
      setShowExceededAlert(true);
    } else if (newRemaining < totalBudget * 0.1) {
      setShowWarning(true);
    }
  };

  return (
    <div className={`p-4 space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="pt-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
        </p>
        <h1 className="mt-1">예산 대시보드</h1>
      </div>

      {/* Main Budget Display */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className={getColorClass()} size={20} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              남은 소비 예산
            </span>
          </div>
          
          <div className={`font-mono ${getColorClass()}`} style={{ fontSize: '52px', lineHeight: 1 }}>
            ₩{remaining.toLocaleString()}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {percentageUsed.toFixed(1)}% 사용
              </span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                ₩{totalSpent.toLocaleString()} / ₩{totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {percentageUsed >= 90 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm text-red-800">
                <p>예산의 90% 이상을 사용했습니다!</p>
                <p className="text-xs mt-1">지출을 조절해주세요.</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Add Button */}
      {!showQuickInput && (
        <Button
          onClick={() => setShowQuickInput(true)}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          size="lg"
        >
          <Plus className="mr-2" size={20} />
          지출 추가
        </Button>
      )}

      {/* Quick Expense Form */}
      {showQuickInput && (
        <div className="animate-in slide-in-from-bottom-4">
          <QuickExpenseForm
            onSubmit={handleAddExpense}
            onCancel={() => setShowQuickInput(false)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>최근 지출</h2>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            최근 5개
          </span>
        </div>

        <div className="space-y-3">
          {recentExpenses.length === 0 ? (
            <Card className={`p-8 text-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                아직 지출 내역이 없습니다
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                지출을 추가하여 시작하세요
              </p>
            </Card>
          ) : (
            recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={onDeleteExpense}
                isDarkMode={isDarkMode}
              />
            ))
          )}
        </div>
      </div>

      {/* Budget Warning Modal (< 10% remaining) */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className={isDarkMode ? 'bg-gray-900 border-gray-800' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-500">
              <AlertCircle size={24} />
              예산 경고
            </AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              남은 예산이 10% 미만입니다. 이번 달 지출을 신중하게 관리해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setShowWarning(false)} className="mt-4">
            확인
          </Button>
        </AlertDialogContent>
      </AlertDialog>

      {/* Budget Exceeded Modal */}
      <AlertDialog open={showExceededAlert} onOpenChange={setShowExceededAlert}>
        <AlertDialogContent className={isDarkMode ? 'bg-gray-900 border-gray-800' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle size={24} />
              예산 초과!
            </AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              소비 예산을 초과했습니다. 추가 지출은 다음 달 예산에 영향을 줄 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200`}>
            <p className="text-sm text-red-600">
              초과 금액: ₩{Math.abs(remaining).toLocaleString()}
            </p>
          </div>
          <Button onClick={() => setShowExceededAlert(false)} className="mt-4 bg-red-600 hover:bg-red-700">
            확인
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
