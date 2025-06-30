import React, { useEffect, useState } from 'react'
import { useUserProfile } from '../../hooks/useUserProfile'
import { Card } from '../ui/card'
import { 
  TrendingUp, 
  Target, 
  Award, 
  Activity,
  CheckCircle,
  Zap,
  Trophy,
  Briefcase,
  Globe,
  CreditCard,
  Building
} from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

interface ModuleProgress {
  module_name: string
  status: 'inactive' | 'active' | 'completed' | 'paused'
  progress: number
  last_activity: string
}

interface DailyGoal {
  goal_name: string
  target_value: number
  current_value: number
  is_completed: boolean
}

interface Achievement {
  achievement_name: string
  achievement_type: string
  achieved_at: string
}

export const ProgressTracker: React.FC = () => {
  const { profile } = useUserProfile()
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchProgressData()
    }
  }, [profile?.id])

  const fetchProgressData = async () => {
    if (!profile?.id) return

    try {
      // Fetch module progress
      const { data: modules } = await supabase
        .from('module_activations')
        .select('*')
        .eq('user_id', profile.id)

      // Fetch daily goals
      const today = new Date().toISOString().split('T')[0]
      const { data: goals } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', profile.id)
        .eq('goal_type', 'daily')
        .eq('date', today)

      // Fetch recent achievements
      const { data: achievs } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile.id)
        .order('achieved_at', { ascending: false })
        .limit(5)

      setModuleProgress(modules || [])
      setDailyGoals(goals || [])
      setAchievements(achievs || [])
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const moduleIcons: Record<string, React.ElementType> = {
    'Business Setup': Briefcase,
    'Brand Identity': Award,
    'Website Builder': Globe,
    'Payment Setup': CreditCard,
    'Business Banking': Building,
    'Marketing AI': TrendingUp
  }

  const profileCompletion = profile?.completion_percentage || 0
  const activeModules = moduleProgress.filter(m => m.status === 'active').length
  const completedModules = moduleProgress.filter(m => m.status === 'completed').length
  const totalModules = 6 // Total available modules

  // Calculate overall progress
  const overallProgress = Math.round(
    (profileCompletion * 0.3) + // 30% weight for profile
    ((activeModules + completedModules) / totalModules * 100 * 0.7) // 70% weight for modules
  )

  return (
    <div className="space-y-6">
      {/* Main Progress Overview */}
      <Card className="bg-black/30 backdrop-blur-md border-[#6ad040]/40 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
            PROGRESS OVERVIEW
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Completion */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#6ad040"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.2"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#6ad040"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - profileCompletion / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - profileCompletion / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="font-['Orbitron'] font-black text-2xl text-[#6ad040]">
                    {profileCompletion}%
                  </div>
                  <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                    Profile
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] mb-1">
              Profile Completion
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
              {profileCompletion >= 100 ? 'Fully optimized!' : 'Complete your profile'}
            </p>
          </div>

          {/* Active Modules */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full bg-black/50 rounded-full border-4 border-[#6ad040]/20 flex items-center justify-center">
                <div>
                  <div className="font-['Orbitron'] font-black text-3xl text-[#6ad040]">
                    {activeModules + completedModules}
                  </div>
                  <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                    of {totalModules}
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                {completedModules > 0 && (
                  <div className="w-8 h-8 bg-[#6ad040] rounded-full flex items-center justify-center animate-pulse">
                    <Trophy className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] mb-1">
              Active Modules
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
              {activeModules} running, {completedModules} completed
            </p>
          </div>

          {/* Overall Progress */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full bg-gradient-to-br from-[#6ad040]/20 to-[#6ad040]/5 rounded-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-[#6ad040]" />
              </div>
              <motion.div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#6ad040 ${overallProgress}%, transparent ${overallProgress}%)`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1 }}
              />
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] mb-1">
              Overall Progress
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
              {overallProgress}% to full automation
            </p>
          </div>
        </div>
      </Card>

      {/* Module Progress */}
      <Card className="bg-black/30 backdrop-blur-md border-[#6ad040]/40 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
            MODULE PROGRESS
          </h2>
        </div>

        <div className="space-y-4">
          {['Business Setup', 'Brand Identity', 'Website Builder', 'Payment Setup', 'Business Banking', 'Marketing AI'].map(moduleName => {
            const module = moduleProgress.find(m => m.module_name === moduleName)
            const Icon = moduleIcons[moduleName] || Briefcase
            const progress = module?.progress || 0
            const status = module?.status || 'inactive'

            return (
              <div key={moduleName} className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    status === 'completed' ? 'bg-[#6ad040] text-black' :
                    status === 'active' ? 'bg-[#6ad040]/20 text-[#6ad040]' :
                    'bg-black/50 text-[#6ad040]/50'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab]">
                        {moduleName}
                      </h3>
                      <span className={`font-['Space_Mono'] text-xs px-2 py-1 rounded-full ${
                        status === 'completed' ? 'bg-[#6ad040]/20 text-[#6ad040]' :
                        status === 'active' ? 'bg-yellow-500/20 text-yellow-500' :
                        status === 'paused' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === 'completed' ? 'bg-[#6ad040]' :
                          status === 'active' ? 'bg-gradient-to-r from-[#6ad040] to-[#79e74c]' :
                          'bg-[#6ad040]/30'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  
                  <div className="font-['Space_Mono'] text-[#6ad040] text-sm font-bold min-w-[50px] text-right">
                    {progress}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Daily Goals & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goals */}
        <Card className="bg-black/30 backdrop-blur-md border-[#6ad040]/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              TODAY'S GOALS
            </h3>
          </div>
          
          <div className="space-y-3">
            {dailyGoals.length > 0 ? (
              dailyGoals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    goal.is_completed 
                      ? 'bg-[#6ad040] border-[#6ad040]' 
                      : 'border-[#6ad040]/50'
                  }`}>
                    {goal.is_completed && <CheckCircle className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                      {goal.goal_name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#6ad040] transition-all duration-300"
                          style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
                        />
                      </div>
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs">
                        {goal.current_value}/{goal.target_value}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-['Space_Mono'] text-[#b7ffab]/50 text-sm text-center py-4">
                No goals set for today
              </p>
            )}
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card className="bg-black/30 backdrop-blur-md border-[#6ad040]/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              ACHIEVEMENTS
            </h3>
          </div>
          
          <div className="space-y-3">
            {achievements.length > 0 ? (
              achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-[#6ad040]/10 rounded-lg">
                  <Award className="w-5 h-5 text-[#6ad040]" />
                  <div className="flex-1">
                    <div className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                      {achievement.achievement_name}
                    </div>
                    <div className="font-['Space_Mono'] text-[#b7ffab]/50 text-xs">
                      {new Date(achievement.achieved_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-['Space_Mono'] text-[#b7ffab]/50 text-sm text-center py-4">
                Complete tasks to earn achievements
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}