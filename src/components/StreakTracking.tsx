import { useState } from 'react';
import { Flame, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { StreakData } from '../App';
import { Calendar } from './ui/calendar';

interface StreakTrackingProps {
  streakData: StreakData;
  onStreakUpdate: (data: StreakData) => void;
  isDarkMode: boolean;
}

export function StreakTracking({ streakData, onStreakUpdate, isDarkMode }: StreakTrackingProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleCheckIn = () => {
    const today = new Date().toDateString();
    const lastCheck = new Date(streakData.lastCheckDate).toDateString();

    if (today === lastCheck) {
      return; // Already checked in today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = streakData.currentStreak;
    if (lastCheck === yesterdayStr) {
      newStreak += 1; // Continue streak
    } else if (streakData.lastCheckDate) {
      newStreak = 1; // Reset streak
    } else {
      newStreak = 1; // First check-in
    }

    const monthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    const newAchievements = {
      ...streakData.monthlyAchievements,
      [monthKey]: true,
    };

    const newData: StreakData = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakData.longestStreak),
      monthlyAchievements: newAchievements,
      lastCheckDate: new Date().toISOString(),
    };

    onStreakUpdate(newData);
  };

  const canCheckIn = () => {
    const today = new Date().toDateString();
    const lastCheck = new Date(streakData.lastCheckDate).toDateString();
    return today !== lastCheck;
  };

  const milestones = [7, 14, 30, 60, 90, 180];
  const nextMilestone = milestones.find((m) => m > streakData.currentStreak) || 365;
  const previousMilestone = milestones.filter((m) => m <= streakData.currentStreak).pop() || 0;
  const milestoneProgress = ((streakData.currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  const achievedMonths = Object.keys(streakData.monthlyAchievements).length;

  return (
    <div className={`p-4 space-y-6 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="pt-4">
        <h1>연속 기록</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          매일 목표를 달성하고 연속 기록을 이어가세요
        </p>
      </div>

      {/* Main Streak Display */}
      <Card className={`p-8 text-center ${isDarkMode ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-gray-800' : 'bg-gradient-to-br from-orange-50 to-red-50'}`}>
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mb-4">
            <span style={{ fontSize: '64px' }}>🔥</span>
          </div>
        </div>
        <div className="font-mono text-orange-600" style={{ fontSize: '56px', lineHeight: 1 }}>
          {streakData.currentStreak}
        </div>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          일 연속
        </p>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          최고 기록: {streakData.longestStreak}일
        </p>
      </Card>

      {/* Check-in Button */}
      <Button
        onClick={handleCheckIn}
        disabled={!canCheckIn()}
        className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500"
        size="lg"
      >
        {canCheckIn() ? (
          <div className="flex items-center gap-2">
            <Flame size={20} />
            오늘 체크인
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Flame size={20} />
            오늘 이미 체크인 완료!
          </div>
        )}
      </Button>

      {/* Milestone Progress */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2>다음 마일스톤</h2>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            {nextMilestone}일
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={milestoneProgress} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {previousMilestone}일
            </span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {streakData.currentStreak}일 / {nextMilestone}일
            </span>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {milestones.slice(0, 6).map((milestone) => (
            <div
              key={milestone}
              className={`p-3 rounded-lg text-center transition-all ${
                streakData.currentStreak >= milestone
                  ? isDarkMode ? 'bg-orange-900/50 border-2 border-orange-600' : 'bg-orange-100 border-2 border-orange-500'
                  : isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'
              }`}
            >
              <Trophy
                className={streakData.currentStreak >= milestone ? 'text-orange-600 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'}
                size={20}
              />
              <p className={`text-xs ${
                streakData.currentStreak >= milestone 
                  ? 'text-orange-600' 
                  : isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {milestone}일
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Achievements */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2>월간 달성</h2>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {achievedMonths}개월 달성
          </span>
        </div>

        <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>뱃지 획득까지</span>
            <span className="text-blue-600">
              {achievedMonths} / 6개월
            </span>
          </div>
          <Progress value={(achievedMonths / 6) * 100} className="mt-2 h-2" />
        </div>

        <Button
          onClick={() => setShowCalendar(!showCalendar)}
          variant="outline"
          className="w-full h-12"
        >
          <CalendarIcon className="mr-2" size={18} />
          {showCalendar ? '캘린더 닫기' : '달성 기록 보기'}
        </Button>

        {showCalendar && (
          <div className="mt-4 animate-in slide-in-from-top-2">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Calendar
                mode="single"
                className="rounded-md"
                modifiers={{
                  achieved: (date) => {
                    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    return !!streakData.monthlyAchievements[monthKey];
                  },
                }}
                modifiersStyles={{
                  achieved: {
                    backgroundColor: '#f97316',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
