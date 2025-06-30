import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'
import { getModuleById, type ModuleDefinition } from '../lib/modules/moduleDefinitions'
import { UserContextService } from '../lib/api/userContextService'
import { OptimizedProfileService } from '../lib/api/optimizedProfileService'

export interface ModuleActivation {
  id: string
  user_id: string
  module_id: string // e.g., 'MOD_101'
  module_name: string
  activated_at: string
  completed_at?: string
  status: 'inactive' | 'active' | 'completed' | 'paused'
  progress: number
  metadata: Record<string, any>
  outputs?: Record<string, any>
  last_activity: string
}

export interface SubModuleCompletion {
  id: string
  user_id: string
  module_id: string
  sub_module_id: string
  completed_at: string
  data: Record<string, any>
}

export const useModuleActivation = () => {
  const { user } = useApp()
  const [modules, setModules] = useState<ModuleActivation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchModules()
    }
  }, [user?.id])

  const fetchModules = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('module_activations')
        .select('module_id, metadata, last_activity')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      if (error) {
        // Handle table not found, column not found, or RLS errors gracefully
        if (error.code === '42P01' || error.code === '42703' || error.message?.includes('Bad Request')) {
          console.log('module_activations table or column not accessible, using empty modules')
          setModules([])
          setError(null)
          return
        }
        throw error
      }
      setModules(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching modules:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch modules')
      setModules([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const activateModule = async (moduleId: string, metadata: Record<string, any> = {}) => {
    if (!user?.id) return null

    try {
      // Get module definition
      const moduleDefinition = getModuleById(moduleId)
      if (!moduleDefinition) {
        throw new Error(`Module ${moduleId} not found in definitions`)
      }

      const existingModule = modules.find(m => m.module_id === moduleId)
      
      if (existingModule) {
        // Update existing module
        const { data, error } = await supabase
          .from('module_activations')
          .update({
            status: 'active',
            progress: existingModule.status === 'completed' ? 0 : existingModule.progress,
            metadata: { ...existingModule.metadata, ...metadata },
            last_activity: new Date().toISOString()
          })
          .eq('id', existingModule.id)
          .select()
          .single()

        if (error) throw error
        
        setModules(prev => prev.map(m => m.id === data.id ? data : m))
        return data
      } else {
        // Create new module activation
        const { data, error } = await supabase
          .from('module_activations')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            module_name: moduleDefinition.name,
            status: 'active',
            progress: 0,
            metadata: {
              ...metadata,
              category: moduleDefinition.category,
              estimated_time: moduleDefinition.estimatedTime
            }
          })
          .select()
          .single()

        if (error) throw error
        
        setModules(prev => [...prev, data])
        return data
      }
    } catch (err) {
      console.error('Error activating module:', err)
      setError(err instanceof Error ? err.message : 'Failed to activate module')
      return null
    }
  }

  const updateModuleProgress = async (moduleId: string, progress: number, metadata?: Record<string, any>) => {
    if (!user?.id) return null

    try {
      const module = modules.find(m => m.module_id === moduleId)
      if (!module) return null

      const updates: any = {
        progress: Math.min(100, Math.max(0, progress)),
        last_activity: new Date().toISOString()
      }

      if (metadata) {
        updates.metadata = { ...module.metadata, ...metadata }
      }

      if (progress >= 100) {
        updates.status = 'completed'
        updates.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('module_activations')
        .update(updates)
        .eq('id', module.id)
        .select()
        .single()

      if (error) throw error
      
      setModules(prev => prev.map(m => m.id === data.id ? data : m))
      
      // Update user context if module completed
      if (progress >= 100) {
        try {
          const profile = await OptimizedProfileService.getCompleteProfile(user.id)
          if (profile) {
            const updatedModules = modules.map(m => m.id === data.id ? data : m)
            UserContextService.updateUserContext(user.id, profile, updatedModules).catch(console.error)
          }
        } catch (error) {
          console.error('Failed to update user context after module completion:', error)
        }
      }
      
      return data
    } catch (err) {
      console.error('Error updating module progress:', err)
      setError(err instanceof Error ? err.message : 'Failed to update module progress')
      return null
    }
  }

  // Complete a sub-module
  const completeSubModule = async (moduleId: string, subModuleId: string, data: Record<string, any> = {}) => {
    if (!user?.id) return null

    try {
      // Save sub-module completion
      const { error } = await supabase
        .from('sub_module_completions')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          sub_module_id: subModuleId,
          data,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,sub_module_id'
        })

      if (error) throw error

      // Get module definition to calculate progress
      const moduleDefinition = getModuleById(moduleId)
      if (moduleDefinition?.subModules) {
        // Get all completed sub-modules for this module
        const { data: completions } = await supabase
          .from('sub_module_completions')
          .select('sub_module_id')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)

        if (completions) {
          const completedIds = completions.map(c => c.sub_module_id)
          const requiredSubModules = moduleDefinition.subModules.filter(sm => sm.required)
          const completedRequired = requiredSubModules.filter(sm => completedIds.includes(sm.id))
          
          const progress = Math.round((completedRequired.length / requiredSubModules.length) * 100)
          await updateModuleProgress(moduleId, progress, { completed_sub_modules: completedIds })
        }
      }

      return true
    } catch (err) {
      console.error('Error completing sub-module:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete sub-module')
      return false
    }
  }

  // Get completed sub-modules for a module
  const getCompletedSubModules = async (moduleId: string): Promise<string[]> => {
    if (!user?.id) return []

    try {
      const { data, error } = await supabase
        .from('sub_module_completions')
        .select('sub_module_id')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)

      if (error) throw error
      return data?.map(d => d.sub_module_id) || []
    } catch (err) {
      console.error('Error fetching completed sub-modules:', err)
      return []
    }
  }

  const pauseModule = async (moduleId: string) => {
    if (!user?.id) return null

    try {
      const module = modules.find(m => m.module_id === moduleId)
      if (!module || module.status !== 'active') return null

      const { data, error } = await supabase
        .from('module_activations')
        .update({
          status: 'paused',
          last_activity: new Date().toISOString()
        })
        .eq('id', module.id)
        .select()
        .single()

      if (error) throw error
      
      setModules(prev => prev.map(m => m.id === data.id ? data : m))
      return data
    } catch (err) {
      console.error('Error pausing module:', err)
      setError(err instanceof Error ? err.message : 'Failed to pause module')
      return null
    }
  }

  const resumeModule = async (moduleId: string) => {
    if (!user?.id) return null

    try {
      const module = modules.find(m => m.module_id === moduleId)
      if (!module || module.status !== 'paused') return null

      const { data, error } = await supabase
        .from('module_activations')
        .update({
          status: 'active',
          last_activity: new Date().toISOString()
        })
        .eq('id', module.id)
        .select()
        .single()

      if (error) throw error
      
      setModules(prev => prev.map(m => m.id === data.id ? data : m))
      return data
    } catch (err) {
      console.error('Error resuming module:', err)
      setError(err instanceof Error ? err.message : 'Failed to resume module')
      return null
    }
  }

  const getModuleStatus = (moduleId: string): ModuleActivation['status'] => {
    const module = modules.find(m => m.module_id === moduleId)
    return module?.status || 'inactive'
  }

  const getModuleProgress = (moduleId: string): number => {
    const module = modules.find(m => m.module_id === moduleId)
    return module?.progress || 0
  }

  const getActiveModules = () => {
    return modules.filter(m => m.status === 'active')
  }

  const getCompletedModules = () => {
    return modules.filter(m => m.status === 'completed')
  }

  const checkDependencies = (moduleId: string): boolean => {
    // Get module definition
    const moduleDefinition = getModuleById(moduleId)
    if (!moduleDefinition?.dependencies) return true
    
    // Check if all required modules are completed
    return moduleDefinition.dependencies.every(depId => {
      const module = modules.find(m => m.module_id === depId)
      return module?.status === 'completed'
    })
  }

  return {
    modules,
    loading,
    error,
    activateModule,
    updateModuleProgress,
    completeSubModule,
    getCompletedSubModules,
    pauseModule,
    resumeModule,
    getModuleStatus,
    getModuleProgress,
    getActiveModules,
    getCompletedModules,
    checkDependencies,
    refetch: fetchModules
  }
}