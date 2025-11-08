import { useState, useEffect } from 'react';
import { Home, List, BarChart3, Flame, Settings as SettingsIcon } from 'lucide-react';
import { BudgetDashboard } from './components/BudgetDashboard';
import { SetupWizard } from './components/SetupWizard';
import { ExpenseList } from './components/ExpenseList';
import { Analytics } from './components/Analytics';
import { StreakTracking } from './components/StreakTracking';
import { Settings } from './components/Settings';
import { AchievementModal } from './components/AchievementModal';
import { Toaster } from './components/ui/sonner';

export type Screen = 'home' | 'expenses' | 'analytics' | 'streak' | 'settings';

export interface BudgetConfig {
  monthlyIncome: number;
  payday: number;
  investmentRatio: number;
  savingsRatio: number;
  consumptionRatio: number;
  investmentTransferred: boolean;
  savingsTransferred: boolean;
}

export interface MonthlyBudget {
  month: string; // Format: "YYYY-MM"
  config: BudgetConfig;
}

export interface Expense {
  id: string;
  amount: number;
  memo: string;
  category: 'essential' | 'flexible';
  date: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  monthlyAchievements: { [key: string]: boolean };
  lastCheckDate: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig | null>(null);
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    monthlyAchievements: {},
    lastCheckDate: '',
  });
  const [showAchievement, setShowAchievement] = useState(false);
  const [showPaydayDialog, setShowPaydayDialog] = useState(false);
  const [lastPaydayCheck, setLastPaydayCheck] = useState('');
  const [achievementType, setAchievementType] = useState<'streak' | 'budget'>('streak');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('budgetConfig');
    const savedMonthlyBudgets = localStorage.getItem('monthlyBudgets');
    const savedExpenses = localStorage.getItem('expenses');
    const savedStreak = localStorage.getItem('streakData');
    const savedTheme = localStorage.getItem('theme');
    const savedLastPaydayCheck = localStorage.getItem('lastPaydayCheck');

    if (savedConfig) {
      setBudgetConfig(JSON.parse(savedConfig));
      setIsSetupComplete(true);
    }
    if (savedMonthlyBudgets) {
      setMonthlyBudgets(JSON.parse(savedMonthlyBudgets));
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedStreak) {
      setStreakData(JSON.parse(savedStreak));
    }
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    if (savedLastPaydayCheck) {
      setLastPaydayCheck(savedLastPaydayCheck);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (budgetConfig) {
      localStorage.setItem('budgetConfig', JSON.stringify(budgetConfig));
    }
  }, [budgetConfig]);

  useEffect(() => {
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
  }, [monthlyBudgets]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('streakData', JSON.stringify(streakData));
  }, [streakData]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('lastPaydayCheck', lastPaydayCheck);
  }, [lastPaydayCheck]);

  const handleSetupComplete = (config: BudgetConfig) => {
    setBudgetConfig(config);
    setIsSetupComplete(true);
    
    // Save to monthly budgets
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const newMonthlyBudget: MonthlyBudget = { month: currentMonth, config };
    setMonthlyBudgets([...monthlyBudgets, newMonthlyBudget]);
    setLastPaydayCheck(new Date().toISOString());
  };

  const handleUpdateBudget = (config: BudgetConfig) => {
    setBudgetConfig(config);
    
    // Update or add current month's budget
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingIndex = monthlyBudgets.findIndex(mb => mb.month === currentMonth);
    
    if (existingIndex >= 0) {
      const updated = [...monthlyBudgets];
      updated[existingIndex] = { month: currentMonth, config };
      setMonthlyBudgets(updated);
    } else {
      setMonthlyBudgets([...monthlyBudgets, { month: currentMonth, config }]);
    }
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleResetBudget = () => {
    setBudgetConfig(null);
    setMonthlyBudgets([]);
    setExpenses([]);
    setStreakData({
      currentStreak: 0,
      longestStreak: 0,
      monthlyAchievements: {},
      lastCheckDate: '',
    });
    setIsSetupComplete(false);
    setLastPaydayCheck('');
    localStorage.clear();
  };

  const handleClearData = () => {
    setExpenses([]);
    setStreakData({
      currentStreak: 0,
      longestStreak: 0,
      monthlyAchievements: {},
      lastCheckDate: '',
    });
  };

  // Check for payday
  useEffect(() => {
    if (!budgetConfig || !isSetupComplete) return;

    const checkPayday = () => {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.toISOString().slice(0, 7);
      const lastCheck = lastPaydayCheck ? new Date(lastPaydayCheck) : null;
      const lastCheckMonth = lastCheck?.toISOString().slice(0, 7);

      // Check if today is payday and we haven't checked this month
      if (currentDay === budgetConfig.payday && currentMonth !== lastCheckMonth) {
        setShowPaydayDialog(true);
      }
    };

    checkPayday();
  }, [budgetConfig, isSetupComplete, lastPaydayCheck]);

  const handlePaydaySkip = () => {
    setShowPaydayDialog(false);
    setLastPaydayCheck(new Date().toISOString());
  };

  const handlePaydayReconfigure = () => {
    setShowPaydayDialog(false);
    setCurrentScreen('settings');
  };

  const handleStreakUpdate = (newStreak: StreakData) => {
    setStreakData(newStreak);
    if (newStreak.currentStreak > streakData.currentStreak && newStreak.currentStreak % 7 === 0) {
      setAchievementType('streak');
      setShowAchievement(true);
    }
  };

  if (!isSetupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="mx-auto max-w-[600px] min-h-screen flex flex-col pb-16">
        {/* Screen Content */}
        <div className="flex-1">
          {currentScreen === 'home' && (
            <BudgetDashboard
              budgetConfig={budgetConfig!}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              isDarkMode={isDarkMode}
            />
          )}
          {currentScreen === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onUpdateExpense={handleUpdateExpense}
              isDarkMode={isDarkMode}
            />
          )}
          {currentScreen === 'analytics' && (
            <Analytics
              budgetConfig={budgetConfig!}
              monthlyBudgets={monthlyBudgets}
              expenses={expenses}
              onAchievementUnlock={() => {
                setAchievementType('budget');
                setShowAchievement(true);
              }}
              isDarkMode={isDarkMode}
            />
          )}
          {currentScreen === 'streak' && (
            <StreakTracking
              streakData={streakData}
              onStreakUpdate={handleStreakUpdate}
              isDarkMode={isDarkMode}
            />
          )}
          {currentScreen === 'settings' && (
            <Settings
              budgetConfig={budgetConfig!}
              onResetBudget={handleResetBudget}
              onClearData={handleClearData}
              onUpdateBudget={handleUpdateBudget}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} flex items-center justify-around max-w-[600px] mx-auto`}>
          <button
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentScreen === 'home' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">홈</span>
          </button>
          <button
            onClick={() => setCurrentScreen('expenses')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentScreen === 'expenses' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <List size={24} />
            <span className="text-xs mt-1">내역</span>
          </button>
          <button
            onClick={() => setCurrentScreen('analytics')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentScreen === 'analytics' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <BarChart3 size={24} />
            <span className="text-xs mt-1">분석</span>
          </button>
          <button
            onClick={() => setCurrentScreen('streak')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentScreen === 'streak' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Flame size={24} />
            <span className="text-xs mt-1">연속</span>
          </button>
          <button
            onClick={() => setCurrentScreen('settings')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentScreen === 'settings' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <SettingsIcon size={24} />
            <span className="text-xs mt-1">설정</span>
          </button>
        </nav>
      </div>

      <AchievementModal
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        type={achievementType}
        streak={streakData.currentStreak}
        isDarkMode={isDarkMode}
      />

      {/* Payday Dialog */}
      {showPaydayDialog && budgetConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`mx-4 max-w-md rounded-lg p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">💰</div>
              <h2 className="mb-2">급여일입니다!</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                이번 달 예산을 다시 설정하시겠습니까?
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handlePaydayReconfigure}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                예산 재설정하기
              </button>
              <button
                onClick={handlePaydaySkip}
                className={`w-full h-12 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                이전 설정 유지
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
