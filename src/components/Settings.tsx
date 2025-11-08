import { useState } from 'react';
import { Moon, Sun, Trash2, RotateCcw, AlertTriangle, Edit } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { BudgetConfig } from '../App';
import { SetupWizard } from './SetupWizard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface SettingsProps {
  budgetConfig: BudgetConfig;
  onResetBudget: () => void;
  onClearData: () => void;
  onUpdateBudget: (config: BudgetConfig) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Settings({
  budgetConfig,
  onResetBudget,
  onClearData,
  onUpdateBudget,
  isDarkMode,
  onToggleDarkMode,
}: SettingsProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);

  const handleEditComplete = (config: BudgetConfig) => {
    onUpdateBudget(config);
    setShowEditBudget(false);
  };

  if (showEditBudget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-[600px] mx-auto">
          <Button
            onClick={() => setShowEditBudget(false)}
            variant="outline"
            className="mb-4"
          >
            ← 돌아가기
          </Button>
          <SetupWizard onComplete={handleEditComplete} initialConfig={budgetConfig} />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="pt-4">
        <h1>설정</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          앱 설정 및 데이터 관리
        </p>
      </div>

      {/* Current Budget Info */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <h2 className="mb-4">현재 예산 설정</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>월 소득</span>
            <span className="font-mono">₩{budgetConfig.monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>급여일</span>
            <span>매월 {budgetConfig.payday}일</span>
          </div>
          <hr className={isDarkMode ? 'border-gray-800' : 'border-gray-200'} />
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>투자</span>
            <span className="text-blue-600">
              {budgetConfig.investmentRatio}% (₩
              {((budgetConfig.monthlyIncome * budgetConfig.investmentRatio) / 100).toLocaleString()})
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>저축</span>
            <span className="text-green-600">
              {budgetConfig.savingsRatio}% (₩
              {((budgetConfig.monthlyIncome * budgetConfig.savingsRatio) / 100).toLocaleString()})
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>소비</span>
            <span className="text-yellow-600">
              {budgetConfig.consumptionRatio}% (₩
              {((budgetConfig.monthlyIncome * budgetConfig.consumptionRatio) / 100).toLocaleString()})
            </span>
          </div>
        </div>
        <Button
          onClick={() => setShowEditBudget(true)}
          variant="outline"
          className="w-full h-12 mt-4 justify-start text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Edit className="mr-2" size={18} />
          예산 설정 수정
        </Button>
      </Card>

      {/* Appearance */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <h2 className="mb-4">화면 설정</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            <div>
              <Label htmlFor="dark-mode" className="cursor-pointer">
                다크 모드
              </Label>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isDarkMode ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
              </p>
            </div>
          </div>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={onToggleDarkMode}
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <h2 className="mb-4">데이터 관리</h2>
        <div className="space-y-3">
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="outline"
            className="w-full h-12 justify-start text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <Trash2 className="mr-2" size={18} />
            모든 지출 내역 삭제
          </Button>
          <Button
            onClick={() => setShowResetDialog(true)}
            variant="outline"
            className="w-full h-12 justify-start text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <RotateCcw className="mr-2" size={18} />
            예산 설정 초기화
          </Button>
        </div>
      </Card>

      {/* App Info */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <h2 className="mb-4">앱 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>버전</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>마지막 업데이트</span>
            <span>2025.11.08</span>
          </div>
        </div>
      </Card>

      {/* Clear Data Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className={isDarkMode ? 'bg-gray-900 border-gray-800' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle size={24} />
              지출 내역 삭제
            </AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              모든 지출 내역과 연속 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              <br />
              예산 설정은 유지됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearData();
                setShowClearDialog(false);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Budget Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className={isDarkMode ? 'bg-gray-900 border-gray-800' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={24} />
              예산 설정 초기화
            </AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              모든 데이터가 삭제되고 초기 설정 화면으로 돌아갑니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>
              <strong>다음 항목이 모두 삭제됩니다:</strong>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>예산 설정</li>
              <li>모든 지출 내역</li>
              <li>연속 기록</li>
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onResetBudget();
                setShowResetDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
