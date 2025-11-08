import { useState } from 'react';
import { TrendingUp, CheckCircle2, Target, PiggyBank } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { BudgetConfig, Expense, MonthlyBudget } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AnalyticsProps {
  budgetConfig: BudgetConfig;
  monthlyBudgets: MonthlyBudget[];
  expenses: Expense[];
  onAchievementUnlock: () => void;
  isDarkMode: boolean;
}

export function Analytics({
  budgetConfig,
  monthlyBudgets,
  expenses,
  onAchievementUnlock,
  isDarkMode,
}: AnalyticsProps) {
  const [goalAchieved, setGoalAchieved] = useState(false);

  // Current month stats
  const totalBudget = budgetConfig.monthlyIncome;
  const investmentBudget = (totalBudget * budgetConfig.investmentRatio) / 100;
  const savingsBudget = (totalBudget * budgetConfig.savingsRatio) / 100;
  const consumptionBudget = (totalBudget * budgetConfig.consumptionRatio) / 100;
  
  // Filter current month expenses
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate cumulative totals across all months
  const calculateCumulativeStats = () => {
    const stats = {
      totalInvestment: 0,
      totalSavings: 0,
      totalConsumption: 0,
      totalSurplus: 0,
    };

    monthlyBudgets.forEach(mb => {
      const monthlyIncome = mb.config.monthlyIncome;
      const monthExpenses = expenses.filter(e => e.date.startsWith(mb.month));
      const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const monthConsumptionBudget = (monthlyIncome * mb.config.consumptionRatio) / 100;

      if (mb.config.investmentTransferred) {
        stats.totalInvestment += (monthlyIncome * mb.config.investmentRatio) / 100;
      }
      if (mb.config.savingsTransferred) {
        stats.totalSavings += (monthlyIncome * mb.config.savingsRatio) / 100;
      }
      stats.totalConsumption += monthSpent;
      
      // Calculate surplus for this month
      const monthSurplus = monthConsumptionBudget - monthSpent;
      if (monthSurplus > 0) {
        stats.totalSurplus += monthSurplus;
      }
    });

    return stats;
  };

  const cumulativeStats = calculateCumulativeStats();

  const investmentProgress = budgetConfig.investmentTransferred ? 100 : 0;
  const savingsProgress = budgetConfig.savingsTransferred ? 100 : 0;
  const consumptionProgress = Math.min((totalSpent / consumptionBudget) * 100, 100);

  const essentialExpenses = expenses
    .filter((e) => e.category === 'essential')
    .reduce((sum, e) => sum + e.amount, 0);
  const flexibleExpenses = expenses
    .filter((e) => e.category === 'flexible')
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetData = [
    { name: '투자', value: investmentBudget, color: '#3b82f6' },
    { name: '저축', value: savingsBudget, color: '#10b981' },
    { name: '소비 (사용)', value: totalSpent, color: '#f59e0b' },
    { name: '소비 (남음)', value: Math.max(consumptionBudget - totalSpent, 0), color: '#e5e7eb' },
  ];

  const spendingData = [
    { name: '필수 지출', value: essentialExpenses, color: '#3b82f6' },
    { name: '선택 지출', value: flexibleExpenses, color: '#a855f7' },
  ];

  const totalProgress = (investmentProgress + savingsProgress + (100 - consumptionProgress)) / 3;

  const handleGoalCheck = () => {
    if (totalProgress >= 80) {
      setGoalAchieved(true);
      onAchievementUnlock();
    }
  };

  return (
    <div className={`p-4 space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="pt-4">
        <h1>분석</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 예산 현황
        </p>
      </div>

      {/* Overall Achievement */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-blue-600" size={24} />
          <h2>목표 달성률</h2>
        </div>
        <div className="text-center mb-4">
          <div className="font-mono text-blue-600" style={{ fontSize: '48px' }}>
            {totalProgress.toFixed(1)}%
          </div>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            투자와 저축을 완료하고 소비를 줄일수록 높아집니다
          </p>
        </div>
        <Progress value={totalProgress} className="h-3" />
      </Card>

      {/* Budget Distribution Chart */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <h2 className="mb-4">예산 배분</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₩${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#000',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Progress */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <h2 className="mb-4">카테고리별 진행률</h2>
        <div className="space-y-6">
          {/* Investment */}
          <div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>투자</span>
              </div>
              <div className="text-right">
                <p className="font-mono">₩{investmentBudget.toLocaleString()}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {budgetConfig.investmentRatio}%
                </p>
              </div>
            </div>
            <Progress value={investmentProgress} className="h-2" />
            {budgetConfig.investmentTransferred && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                이체 완료
              </p>
            )}
          </div>

          {/* Savings */}
          <div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>저축</span>
              </div>
              <div className="text-right">
                <p className="font-mono">₩{savingsBudget.toLocaleString()}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {budgetConfig.savingsRatio}%
                </p>
              </div>
            </div>
            <Progress value={savingsProgress} className="h-2" />
            {budgetConfig.savingsTransferred && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                이체 완료
              </p>
            )}
          </div>

          {/* Consumption */}
          <div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>소비</span>
              </div>
              <div className="text-right">
                <p className="font-mono">
                  ₩{totalSpent.toLocaleString()} / ₩{consumptionBudget.toLocaleString()}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {budgetConfig.consumptionRatio}%
                </p>
              </div>
            </div>
            <div className="relative">
              <Progress value={consumptionProgress} className="h-2" />
              {consumptionProgress > 90 && (
                <p className="text-xs text-red-600 mt-1">예산 초과 임박</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Spending Breakdown */}
      {expenses.length > 0 && (
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
          <h2 className="mb-4">지출 세부 내역</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `₩${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Cumulative Stats */}
      {monthlyBudgets.length > 0 && (
        <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <PiggyBank className="text-indigo-600" size={24} />
            <h2>누적 통계</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 투자</p>
              <p className="font-mono text-blue-600" style={{ fontSize: '18px' }}>
                ₩{cumulativeStats.totalInvestment.toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 저축</p>
              <p className="font-mono text-green-600" style={{ fontSize: '18px' }}>
                ₩{cumulativeStats.totalSavings.toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 소비</p>
              <p className="font-mono text-yellow-600" style={{ fontSize: '18px' }}>
                ₩{cumulativeStats.totalConsumption.toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>잉여 자산</p>
              <p className="font-mono text-purple-600" style={{ fontSize: '18px' }}>
                ₩{cumulativeStats.totalSurplus.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong className="text-purple-600">잉여 자산</strong>은 월 소비 예산을 덜 쓴 금액의 누적입니다.
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {monthlyBudgets.length}개월 데이터 기반
            </p>
          </div>
        </Card>
      )}

      {/* Achievement Button */}
      <Button
        onClick={handleGoalCheck}
        disabled={goalAchieved || totalProgress < 80}
        className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500"
        size="lg"
      >
        {goalAchieved ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} />
            월 목표 달성 완료!
          </div>
        ) : totalProgress >= 80 ? (
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            월 목표 달성 확인
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Target size={20} />
            목표 달성률 80% 이상 필요
          </div>
        )}
      </Button>
    </div>
  );
}
