import { useState } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { BudgetConfig } from '../App';

interface SetupWizardProps {
  onComplete: (config: BudgetConfig) => void;
  initialConfig?: BudgetConfig;
}

export function SetupWizard({ onComplete, initialConfig }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState(initialConfig?.monthlyIncome.toString() || '');
  const [payday, setPayday] = useState(initialConfig?.payday || 1);
  const [investmentRatio, setInvestmentRatio] = useState(initialConfig?.investmentRatio || 70);
  const [savingsRatio, setSavingsRatio] = useState(initialConfig?.savingsRatio || 20);
  const [consumptionRatio, setConsumptionRatio] = useState(initialConfig?.consumptionRatio || 10);
  const [investmentTransferred, setInvestmentTransferred] = useState(initialConfig?.investmentTransferred || false);
  const [savingsTransferred, setSavingsTransferred] = useState(initialConfig?.savingsTransferred || false);

  const handleStep1Next = () => {
    if (monthlyIncome && parseFloat(monthlyIncome) > 0) {
      setStep(2);
    }
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleComplete = () => {
    const config: BudgetConfig = {
      monthlyIncome: parseFloat(monthlyIncome),
      payday,
      investmentRatio,
      savingsRatio,
      consumptionRatio,
      investmentTransferred,
      savingsTransferred,
    };
    onComplete(config);
  };

  const income = parseFloat(monthlyIncome) || 0;
  const investmentAmount = (income * investmentRatio) / 100;
  const savingsAmount = (income * savingsRatio) / 100;
  const consumptionAmount = (income * consumptionRatio) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex flex-col">
      <div className="max-w-[600px] mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="py-6">
          <h1 className="text-center mb-2">예산 설정</h1>
          <p className="text-center text-gray-600">
            {step === 1 && '월 소득 정보를 입력하세요'}
            {step === 2 && '예산 비율을 설정하세요'}
            {step === 3 && '이체 완료를 확인하세요'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={(step / 3) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className={step >= 1 ? 'text-blue-600' : ''}>1. 소득</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>2. 비율</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>3. 이체</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1">
          {/* Step 1: Income Input */}
          {step === 1 && (
            <Card className="p-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="income">월 소득</Label>
                  <div className="relative mt-2">
                    <Input
                      id="income"
                      type="number"
                      placeholder="3,000,000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="text-right pr-12 h-14"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="payday">급여일</Label>
                  <div className="relative mt-2">
                    <Input
                      id="payday"
                      type="number"
                      min="1"
                      max="31"
                      value={payday}
                      onChange={(e) => setPayday(parseInt(e.target.value) || 1)}
                      className="text-right pr-12 h-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">일</span>
                  </div>
                </div>

                {income > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">월 예상 소득</p>
                    <p className="font-mono" style={{ fontSize: '32px' }}>
                      ₩{income.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 2: Budget Ratios */}
          {step === 2 && (
            <Card className="p-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>투자 ({investmentRatio}%)</Label>
                    <span className="font-mono text-gray-600">
                      ₩{investmentAmount.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[investmentRatio]}
                    onValueChange={(value) => {
                      const newInvestment = value[0];
                      const remaining = 100 - newInvestment;
                      const savingsPercent = Math.round((savingsRatio / (savingsRatio + consumptionRatio)) * remaining);
                      setSavingsRatio(savingsPercent);
                      setConsumptionRatio(remaining - savingsPercent);
                      setInvestmentRatio(newInvestment);
                    }}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>저축 ({savingsRatio}%)</Label>
                    <span className="font-mono text-gray-600">
                      ₩{savingsAmount.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[savingsRatio]}
                    onValueChange={(value) => {
                      const newSavings = value[0];
                      const maxSavings = 100 - investmentRatio;
                      if (newSavings <= maxSavings) {
                        setSavingsRatio(newSavings);
                        setConsumptionRatio(100 - investmentRatio - newSavings);
                      }
                    }}
                    max={100 - investmentRatio}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>소비 ({consumptionRatio}%)</Label>
                    <span className="font-mono text-gray-600">
                      ₩{consumptionAmount.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[consumptionRatio]}
                    onValueChange={(value) => {
                      const newConsumption = value[0];
                      const maxConsumption = 100 - investmentRatio;
                      if (newConsumption <= maxConsumption) {
                        setConsumptionRatio(newConsumption);
                        setSavingsRatio(100 - investmentRatio - newConsumption);
                      }
                    }}
                    max={100 - investmentRatio}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">총 비율</p>
                  <p className="text-2xl">
                    {investmentRatio + savingsRatio + consumptionRatio}%
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <Card className="p-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="mb-2">이체 확인</h2>
                  <p className="text-gray-600">
                    투자 및 저축 계좌로 이체를 완료했나요?
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setInvestmentTransferred(!investmentTransferred)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      investmentTransferred
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">투자 계좌 이체</p>
                        <p className="font-mono mt-1">
                          ₩{investmentAmount.toLocaleString()}
                        </p>
                      </div>
                      {investmentTransferred && (
                        <CheckCircle2 className="text-green-500" size={24} />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setSavingsTransferred(!savingsTransferred)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      savingsTransferred
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">저축 계좌 이체</p>
                        <p className="font-mono mt-1">
                          ₩{savingsAmount.toLocaleString()}
                        </p>
                      </div>
                      {savingsTransferred && (
                        <CheckCircle2 className="text-green-500" size={24} />
                      )}
                    </div>
                  </button>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>소비 예산</strong>으로 사용 가능한 금액
                  </p>
                  <p className="font-mono mt-2" style={{ fontSize: '28px' }}>
                    ₩{consumptionAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 space-y-3">
          {step < 3 ? (
            <Button
              onClick={step === 1 ? handleStep1Next : handleStep2Next}
              disabled={step === 1 && (!monthlyIncome || parseFloat(monthlyIncome) <= 0)}
              className="w-full h-14"
              size="lg"
            >
              다음
              <ChevronRight className="ml-2" size={20} />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!investmentTransferred || !savingsTransferred}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              설정 완료
            </Button>
          )}
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="w-full h-14"
              size="lg"
            >
              이전
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
