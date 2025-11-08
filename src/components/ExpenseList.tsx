import { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ExpenseCard } from './ExpenseCard';
import { Expense } from '../App';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  isDarkMode: boolean;
}

export function ExpenseList({
  expenses,
  onDeleteExpense,
  onUpdateExpense,
  isDarkMode,
}: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.memo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeTab === 'all' ||
      (activeTab === 'essential' && expense.category === 'essential') ||
      (activeTab === 'flexible' && expense.category === 'flexible');
    return matchesSearch && matchesCategory;
  });

  // Group expenses by date
  const groupedExpenses: { [key: string]: Expense[] } = {};
  filteredExpenses.forEach((expense) => {
    const date = new Date(expense.date).toLocaleDateString('ko-KR');
    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(expense);
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className={`p-4 space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="pt-4">
        <h1>지출 내역</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          총 {filteredExpenses.length}건 · ₩{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} size={20} />
        <Input
          type="text"
          placeholder="지출 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full grid-cols-3 ${isDarkMode ? 'bg-gray-900' : ''}`}>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="essential">필수</TabsTrigger>
          <TabsTrigger value="flexible">선택</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {Object.keys(groupedExpenses).length === 0 ? (
            <Card className={`p-8 text-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
              <Calendar className={`mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {searchQuery ? '검색 결과가 없습니다' : '지출 내역이 없습니다'}
              </p>
            </Card>
          ) : (
            Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={16} />
                  <h3 className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{date}</h3>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {dateExpenses.length}건
                  </span>
                </div>
                <div className="space-y-3">
                  {dateExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onDelete={onDeleteExpense}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
