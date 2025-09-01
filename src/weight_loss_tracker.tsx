import React, { useState, useEffect } from 'react';
import { Scale, Target, Droplets, TrendingDown, Calendar, Plus, Minus, BarChart3, Settings, PlusCircle } from 'lucide-react';

const WeightLossTracker = () => {
  // Load data from localStorage or use defaults
  const loadData = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  };

  // Save data to localStorage
  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // User profile and goals - loaded from localStorage
  const [profile, setProfile] = useState(() => 
    loadData('weightLossProfile', {
      startWeight: 82,
      goalWeight: 68,
      targetDate: '2025-12-01',
      dailyCalorieBurnGoal: 2200,
      dailyWaterGoal: 8
    })
  );

  // Daily tracking data - loaded from localStorage
  const [weightEntries, setWeightEntries] = useState(() => 
    loadData('weightEntries', [
      { date: '2025-08-25', weight: 82 },
      { date: '2025-08-26', weight: 81.7 },
      { date: '2025-08-27', weight: 81.9 },
      { date: '2025-08-28', weight: 81.5 },
      { date: '2025-08-29', weight: 81.2 },
      { date: '2025-08-30', weight: 80.9 },
      { date: '2025-08-31', weight: 80.6 }
    ])
  );

  // Today's data - loaded from localStorage with today's date as key
  const today = new Date().toISOString().split('T')[0];
  const [todayData, setTodayData] = useState(() => 
    loadData(`dailyData_${today}`, {
      weight: '',
      caloriesBurned: 0,
      waterGlasses: 0
    })
  );

  const [activeTab, setActiveTab] = useState('dashboard');

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveData('weightLossProfile', profile);
  }, [profile]);

  useEffect(() => {
    saveData('weightEntries', weightEntries);
  }, [weightEntries]);

  useEffect(() => {
    saveData(`dailyData_${today}`, todayData);
  }, [todayData, today]);

  // Calculate progress metrics
  const currentWeight = weightEntries[weightEntries.length - 1]?.weight || profile.startWeight;
  const totalWeightToLose = profile.startWeight - profile.goalWeight;
  const weightLost = profile.startWeight - currentWeight;
  const progressPercentage = Math.min((weightLost / totalWeightToLose) * 100, 100);

  // Calculate time-based progress
  const startDate = new Date(weightEntries[0]?.date || '2025-08-25');
  const targetDate = new Date(profile.targetDate);
  const currentDate = new Date();
  
  const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24)));
  
  const timeProgressPercentage = Math.min((daysPassed / totalDays) * 100, 100);
  const requiredWeightLossRate = totalWeightToLose / totalDays; // kg per day
  const actualWeightLossRate = weightLost / daysPassed;
  
  const isOnTrack = actualWeightLossRate >= requiredWeightLossRate * 0.8; // 80% threshold
  const projectedFinalWeight = currentWeight - (actualWeightLossRate * daysRemaining);

  // Calculate 7-day rolling average
  const last7Days = weightEntries.slice(-7);
  const rollingAverage = last7Days.reduce((sum, entry) => sum + entry.weight, 0) / last7Days.length;

  // Get today's date
  const addWeightEntry = () => {
    if (todayData.weight) {
      const newEntry = { date: today, weight: parseFloat(todayData.weight) };
      const updatedEntries = [...weightEntries.filter(e => e.date !== today), newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
      setWeightEntries(updatedEntries);
      setTodayData({ ...todayData, weight: '' });
    }
  };

  const adjustCalories = (amount) => {
    setTodayData({ ...todayData, caloriesBurned: Math.max(0, todayData.caloriesBurned + amount) });
  };

  const adjustWater = (amount) => {
    setTodayData({ ...todayData, waterGlasses: Math.max(0, todayData.waterGlasses + amount) });
  };

  const getMotivationalMessage = () => {
    if (daysRemaining <= 0) return "🏁 Target date reached! How did you do?";
    if (!isOnTrack && progressPercentage < 25) return "⚡ Time to step it up! You've got this! 💪";
    if (!isOnTrack) return "🔥 Push harder! Your goal is within reach! 🎯";
    if (progressPercentage >= 80) return "🌟 Amazing pace! You're crushing it! 🏆";
    if (progressPercentage >= 50) return "💪 Perfect pace! Stay consistent! ⭐";
    return "🎯 Great start! You're on track! Keep going! 🚀";
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center py-3 px-2 ${
        activeTab === id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">My Journey</h1>
        <p className="opacity-90">{getMotivationalMessage()}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
                <Target className="text-green-600" size={24} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {currentWeight.toFixed(1)} kg</span>
                  <span>Goal: {profile.goalWeight} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{weightLost.toFixed(1)} kg lost</span>
                  <span>{progressPercentage.toFixed(1)}% complete</span>
                </div>
              </div>
            </div>

            {/* Target Date & Pace Tracking */}
            <div className={`p-4 rounded-2xl ${isOnTrack ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-orange-50 to-red-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Target Pace</h2>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Target: {new Date(profile.targetDate).toLocaleDateString()}</div>
                  <div className={`text-sm font-medium ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
                    {daysRemaining} days left
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Time Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Time Progress</span>
                    <span>{timeProgressPercentage.toFixed(0)}% of time passed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${timeProgressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Weight vs Time Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Weight Progress</div>
                    <div className={`text-2xl font-bold ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
                      {progressPercentage.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Time Progress</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {timeProgressPercentage.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Pace Indicator */}
                <div className={`p-3 rounded-xl ${isOnTrack ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${isOnTrack ? 'text-green-800' : 'text-orange-800'}`}>
                        {isOnTrack ? '✅ On Track!' : '⚡ Need to Speed Up!'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Projected: {projectedFinalWeight.toFixed(1)} kg by target date
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Required rate</div>
                      <div className="text-sm font-medium">{(requiredWeightLossRate * 7).toFixed(2)} kg/week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rolling Average */}
            <div className="bg-yellow-50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">7-Day Average</h3>
                  <p className="text-2xl font-bold text-yellow-600">{rollingAverage.toFixed(1)} kg</p>
                </div>
                <TrendingDown className="text-yellow-600" size={32} />
              </div>
            </div>

            {/* Today's Summary */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Today's Summary</h2>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 p-3 rounded-xl text-center">
                  <Scale className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm text-purple-600">Weight</div>
                  <div className="font-bold text-purple-800">
                    {todayData.weight || currentWeight.toFixed(1)} kg
                  </div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-xl text-center">
                  <Target className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <div className="text-sm text-orange-600">Burned</div>
                  <div className="font-bold text-orange-800">{todayData.caloriesBurned}</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-xl text-center">
                  <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm text-blue-600">Water</div>
                  <div className="font-bold text-blue-800">{todayData.waterGlasses}/8</div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Calories Burned</span>
                    <span>{todayData.caloriesBurned}/{profile.dailyCalorieBurnGoal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((todayData.caloriesBurned / profile.dailyCalorieBurnGoal) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Water</span>
                    <span>{todayData.waterGlasses}/{profile.dailyWaterGoal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((todayData.waterGlasses / profile.dailyWaterGoal) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Add Today's Data</h2>
            
            {/* Weight Entry */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Daily Weight</h3>
                <Scale className="text-purple-600" size={24} />
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter today's weight (kg)"
                    value={todayData.weight}
                    onChange={(e) => setTodayData({ ...todayData, weight: e.target.value })}
                    className="flex-1 p-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                  <button
                    onClick={addWeightEntry}
                    className="bg-purple-500 text-white px-6 py-4 rounded-xl hover:bg-purple-600 transition-colors font-medium"
                  >
                    Log Weight
                  </button>
                </div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                  💡 Best time to weigh: First thing in the morning, after bathroom, before eating
                </div>
              </div>
            </div>

            {/* Calorie Burn Entry */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl" style={{marginBottom:'100px'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Calories Burned</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Today's total</div>
                  <div className="text-xl font-bold text-orange-600">{todayData.caloriesBurned}/{profile.dailyCalorieBurnGoal}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((todayData.caloriesBurned / profile.dailyCalorieBurnGoal) * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Manual Input */}
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Add burned calories (e.g., 250)"
                    value={todayData.calorieBurnInput || ''}
                    onChange={(e) => setTodayData({ ...todayData, calorieBurnInput: e.target.value })}
                    className="flex-1 p-4 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  />
                  <button
                    onClick={() => {
                      if (todayData.calorieBurnInput) {
                        setTodayData({ 
                          ...todayData, 
                          caloriesBurned: todayData.caloriesBurned + parseInt(todayData.calorieBurnInput), 
                          calorieBurnInput: '' 
                        });
                      }
                    }}
                    className="bg-orange-500 text-white px-6 py-4 rounded-xl hover:bg-orange-600 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                
                {/* Quick Add Activity Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => adjustCalories(200)}
                    className="bg-orange-100 text-orange-700 py-3 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                  >
                    🚶 Walk 30min (200)
                  </button>
                  <button
                    onClick={() => adjustCalories(350)}
                    className="bg-orange-100 text-orange-700 py-3 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                  >
                    🏃 Run 30min (350)
                  </button>
                  <button
                    onClick={() => adjustCalories(250)}
                    className="bg-orange-100 text-orange-700 py-3 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                  >
                    🚴 Bike 30min (250)
                  </button>
                  <button
                    onClick={() => adjustCalories(150)}
                    className="bg-orange-100 text-orange-700 py-3 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                  >
                    🧘 Yoga 30min (150)
                  </button>
                  <button
                    onClick={() => adjustCalories(400)}
                    className="bg-orange-100 text-orange-700 py-3 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                  >
                    🏋️ Gym 45min (400)
                  </button>
                  <button
                    onClick={() => adjustCalories(-50)}
                    className="bg-red-100 text-red-700 py-3 rounded-xl hover:bg-red-200 transition-colors font-medium"
                  >
                    ✏️ Edit (-50)
                  </button>
                </div>

                {/* Activity Suggestions */}
                <div className="bg-white p-4 rounded-xl">
                  <h4 className="font-medium text-gray-700 mb-3">💡 Activity Ideas</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>🏊 Swimming (1 hour)</span>
                      <span className="font-medium text-orange-600">~500 cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🏃 HIIT workout (20 min)</span>
                      <span className="font-medium text-orange-600">~300 cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🚶 Brisk walk (45 min)</span>
                      <span className="font-medium text-orange-600">~250 cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🧹 House cleaning (1 hour)</span>
                      <span className="font-medium text-orange-600">~200 cal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Entry */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Water Intake</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Glasses today</div>
                  <div className="text-xl font-bold text-blue-600">{todayData.waterGlasses}/{profile.dailyWaterGoal}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((todayData.waterGlasses / profile.dailyWaterGoal) * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Manual Input */}
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Add glasses (e.g., 2)"
                    value={todayData.waterInput || ''}
                    onChange={(e) => setTodayData({ ...todayData, waterInput: e.target.value })}
                    className="flex-1 p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  <button
                    onClick={() => {
                      if (todayData.waterInput) {
                        setTodayData({ 
                          ...todayData, 
                          waterGlasses: todayData.waterGlasses + parseInt(todayData.waterInput), 
                          waterInput: '' 
                        });
                      }
                    }}
                    className="bg-blue-500 text-white px-6 py-4 rounded-xl hover:bg-blue-600 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                
                {/* Quick Add Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => adjustWater(1)}
                    className="bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                  >
                    + 1 Glass
                  </button>
                  <button
                    onClick={() => adjustWater(2)}
                    className="bg-blue-100 text-blue-700 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                  >
                    + 2 Glasses
                  </button>
                  <button
                    onClick={() => adjustWater(-1)}
                    className="bg-red-100 text-red-700 py-3 rounded-xl hover:bg-red-200 transition-colors font-medium"
                  >
                    - 1 Glass
                  </button>
                </div>

                {/* Visual Water Tracker */}
                <div className="bg-white p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-3">Daily Progress</div>
                  <div className="grid grid-cols-8 gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-10 rounded-lg transition-all duration-300 ${
                          i < todayData.waterGlasses 
                            ? 'bg-gradient-to-t from-blue-400 to-blue-300 shadow-sm' 
                            : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                        }`}
                        onClick={() => setTodayData({ ...todayData, waterGlasses: i + 1 })}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Tap a glass to set your water level
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Today's Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentWeight.toFixed(1)} kg</div>
                  <div className="text-sm text-gray-600">Current Weight</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{todayData.caloriesBurned}</div>
                  <div className="text-sm text-gray-600">Calories Burned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{todayData.waterGlasses}/8</div>
                  <div className="text-sm text-gray-600">Water</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Weight History</h2>
            <div className="space-y-2">
              {weightEntries.slice(-10).reverse().map((entry, index) => (
                <div key={entry.date} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{entry.weight} kg</span>
                </div>
              ))}
            </div>
            
            {/* Simple Chart */}
            <div className="bg-gray-50 p-4 rounded-2xl">
              <h3 className="font-medium mb-3">Trend</h3>
              <div className="h-32 flex items-end justify-between gap-1">
                {weightEntries.slice(-7).map((entry, index) => {
                  const height = ((profile.startWeight - entry.weight) / (profile.startWeight - profile.goalWeight)) * 100;
                  return (
                    <div key={entry.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-400 rounded-t-lg transition-all duration-300"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(entry.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'graphs' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Progress Charts</h2>
            
            {/* Weight vs Date Chart */}
            <div className="bg-gray-50 p-4 rounded-2xl">
              <h3 className="font-medium mb-4 text-gray-800">Weight Progress</h3>
              <div className="h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 15" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Weight line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={weightEntries.map((entry, index) => {
                      const x = (index / (weightEntries.length - 1)) * 280 + 10;
                      const minWeight = Math.min(...weightEntries.map(e => e.weight));
                      const maxWeight = Math.max(...weightEntries.map(e => e.weight));
                      const weightRange = maxWeight - minWeight || 1;
                      const y = 130 - ((entry.weight - minWeight) / weightRange) * 110;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Weight points */}
                  {weightEntries.map((entry, index) => {
                    const x = (index / (weightEntries.length - 1)) * 280 + 10;
                    const minWeight = Math.min(...weightEntries.map(e => e.weight));
                    const maxWeight = Math.max(...weightEntries.map(e => e.weight));
                    const weightRange = maxWeight - minWeight || 1;
                    const y = 130 - ((entry.weight - minWeight) / weightRange) * 110;
                    return (
                      <circle
                        key={entry.date}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    );
                  })}
                  
                  {/* Y-axis labels */}
                  <text x="5" y="25" fontSize="10" fill="#6b7280" textAnchor="start">
                    {Math.max(...weightEntries.map(e => e.weight)).toFixed(1)}
                  </text>
                  <text x="5" y="135" fontSize="10" fill="#6b7280" textAnchor="start">
                    {Math.min(...weightEntries.map(e => e.weight)).toFixed(1)}
                  </text>
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-3 text-xs text-gray-500">
                  <span>{new Date(weightEntries[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(weightEntries[weightEntries.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Rolling Average vs Date Chart */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl">
              <h3 className="font-medium mb-4 text-gray-800">7-Day Rolling Average</h3>
              <div className="h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  {/* Grid lines */}
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Calculate rolling averages for each point */}
                  {(() => {
                    const rollingAvgs = weightEntries.map((_, index) => {
                      const startIndex = Math.max(0, index - 6);
                      const subset = weightEntries.slice(startIndex, index + 1);
                      const avg = subset.reduce((sum, entry) => sum + entry.weight, 0) / subset.length;
                      return { date: weightEntries[index].date, avg };
                    });

                    const minAvg = Math.min(...rollingAvgs.map(r => r.avg));
                    const maxAvg = Math.max(...rollingAvgs.map(r => r.avg));
                    const avgRange = maxAvg - minAvg || 1;

                    return (
                      <>
                        {/* Rolling average line */}
                        <polyline
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={rollingAvgs.map((item, index) => {
                            const x = (index / (rollingAvgs.length - 1)) * 280 + 10;
                            const y = 130 - ((item.avg - minAvg) / avgRange) * 110;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        
                        {/* Rolling average points */}
                        {rollingAvgs.map((item, index) => {
                          const x = (index / (rollingAvgs.length - 1)) * 280 + 10;
                          const y = 130 - ((item.avg - minAvg) / avgRange) * 110;
                          return (
                            <circle
                              key={item.date}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#f59e0b"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          );
                        })}
                        
                        {/* Y-axis labels */}
                        <text x="5" y="25" fontSize="10" fill="#6b7280" textAnchor="start">
                          {maxAvg.toFixed(1)}
                        </text>
                        <text x="5" y="135" fontSize="10" fill="#6b7280" textAnchor="start">
                          {minAvg.toFixed(1)}
                        </text>
                      </>
                    );
                  })()}
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-3 text-xs text-gray-500">
                  <span>{new Date(weightEntries[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(weightEntries[weightEntries.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Combined Chart */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl">
              <h3 className="font-medium mb-4 text-gray-800">Weight vs Rolling Average</h3>
              <div className="h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {(() => {
                    const rollingAvgs = weightEntries.map((_, index) => {
                      const startIndex = Math.max(0, index - 6);
                      const subset = weightEntries.slice(startIndex, index + 1);
                      const avg = subset.reduce((sum, entry) => sum + entry.weight, 0) / subset.length;
                      return avg;
                    });

                    const allValues = [...weightEntries.map(e => e.weight), ...rollingAvgs];
                    const minValue = Math.min(...allValues);
                    const maxValue = Math.max(...allValues);
                    const valueRange = maxValue - minValue || 1;

                    return (
                      <>
                        {/* Weight line */}
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          points={weightEntries.map((entry, index) => {
                            const x = (index / (weightEntries.length - 1)) * 280 + 10;
                            const y = 130 - ((entry.weight - minValue) / valueRange) * 110;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        
                        {/* Rolling average line */}
                        <polyline
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="3"
                          points={rollingAvgs.map((avg, index) => {
                            const x = (index / (rollingAvgs.length - 1)) * 280 + 10;
                            const y = 130 - ((avg - minValue) / valueRange) * 110;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        
                        {/* Y-axis labels */}
                        <text x="5" y="25" fontSize="10" fill="#6b7280" textAnchor="start">
                          {maxValue.toFixed(1)}
                        </text>
                        <text x="5" y="135" fontSize="10" fill="#6b7280" textAnchor="start">
                          {minValue.toFixed(1)}
                        </text>
                      </>
                    );
                  })()}
                </svg>
                
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-500 border-dashed border border-blue-500"></div>
                    <span className="text-xs text-gray-600">Daily Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-purple-500"></div>
                    <span className="text-xs text-gray-600">7-Day Average</span>
                  </div>
                </div>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-3 text-xs text-gray-500">
                  <span>{new Date(weightEntries[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(weightEntries[weightEntries.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-2xl text-center">
                <h4 className="font-medium text-green-800">Best Day</h4>
                <p className="text-lg font-bold text-green-600">
                  {Math.min(...weightEntries.map(e => e.weight)).toFixed(1)} kg
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl text-center">
                <h4 className="font-medium text-blue-800">Trend</h4>
                <p className="text-lg font-bold text-blue-600">
                  {weightEntries[weightEntries.length - 1].weight < weightEntries[0].weight ? '↓' : '↑'} 
                  {' '}
                  {Math.abs(weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight).toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Goals & Settings</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Weight (kg)</label>
                <input
                  type="number"
                  value={profile.startWeight}
                  onChange={(e) => setProfile({ ...profile, startWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Weight (kg)</label>
                <input
                  type="number"
                  value={profile.goalWeight}
                  onChange={(e) => setProfile({ ...profile, goalWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={profile.targetDate}
                  onChange={(e) => setProfile({ ...profile, targetDate: e.target.value })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 text-xs text-gray-600">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Target date reached!'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calorie Burn Goal</label>
                <input
                  type="number"
                  value={profile.dailyCalorieBurnGoal}
                  onChange={(e) => setProfile({ ...profile, dailyCalorieBurnGoal: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 text-xs text-gray-600">
                  💡 Include BMR (base metabolic rate) + activities
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Water Goal (glasses)</label>
                <input
                  type="number"
                  value={profile.dailyWaterGoal}
                  onChange={(e) => setProfile({ ...profile, dailyWaterGoal: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-2xl">
              <h3 className="font-medium text-yellow-800 mb-2">💡 Reminders</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Daily weigh-in reminder at 7:00 AM</li>
                <li>• Water reminder every 2 hours</li>
                <li>• Evening reflection at 8:00 PM</li>
              </ul>
            </div>

            {/* Data Management */}
            <div className="bg-blue-50 p-4 rounded-2xl">
              <h3 className="font-medium text-blue-800 mb-3">📊 Data Management</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Data Storage Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">
                      All data saved locally on your device
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {weightEntries.length} weight entries • Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const data = {
                        profile,
                        weightEntries,
                        dailyData: todayData,
                        exportDate: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `weight-loss-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-blue-100 text-blue-700 py-2 px-3 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    📤 Export Data
                  </button>
                  
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const data = JSON.parse(event.target.result);
                              if (data.profile) setProfile(data.profile);
                              if (data.weightEntries) setWeightEntries(data.weightEntries);
                              if (data.dailyData) setTodayData(data.dailyData);
                              alert('Data imported successfully!');
                            } catch (error) {
                              alert('Error importing data. Please check the file format.');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="bg-green-100 text-green-700 py-2 px-3 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    📥 Import Data
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm('⚠️ This will delete ALL your data permanently. Are you sure?')) {
                      localStorage.removeItem('weightLossProfile');
                      localStorage.removeItem('weightEntries');
                      Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('dailyData_')) {
                          localStorage.removeItem(key);
                        }
                      });
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-red-100 text-red-700 py-2 px-3 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  🗑️ Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex">
          <TabButton id="dashboard" label="Home" icon={Target} />
          <TabButton id="add" label="Add" icon={PlusCircle} />
          <TabButton id="graphs" label="Charts" icon={BarChart3} />
          <TabButton id="history" label="History" icon={Calendar} />
          <TabButton id="settings" label="Settings" icon={Settings} />
        </div>
      </div>
    </div>
  );
};

export default WeightLossTracker;