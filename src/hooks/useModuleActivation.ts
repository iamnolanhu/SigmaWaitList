import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'

export interface ModuleActivation {
  id: string
  user_id: string
  module_name: string
  activated_at: string
  status: 'inactive' | 'active' | 'completed' | 'paused'
  progress: number
  metadata: Record<string, any>
  last_activity: string
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
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setModules(data || [])
    } catch (err) {
      console.error('Error fetching modules:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch modules')
    } finally {
      setLoading(false)
    }
  }

  const activateModule = async (moduleName: string, metadata: Record<string, any> = {}) => {
    if (!user?.id) return null

    try {
      const existingModule = modules.find(m => m.module_name === moduleName)
      
      if (existingModule) {
        // Update existing module
        const { data, error } = await supabase
          .from('module_activations')
          .update({
            status: 'active',
            progress: 0,
            metadata,
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
            module_name: moduleName,
            status: 'active',
            progress: 0,
            metadata
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

  const updateModuleProgress = async (moduleName: string, progress: number, metadata?: Record<string, any>) => {
    if (!user?.id) return null

    try {
      const module = modules.find(m => m.module_name === moduleName)
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
      }

      const { data, error } = await supabase
        .from('module_activations')
        .update(updates)
        .eq('id', module.id)
        .select()
        .single()

      if (error) throw error
      
      setModules(prev => prev.map(m => m.id === data.id ? data : m))
      return data
    } catch (err) {
      console.error('Error updating module progress:', err)
      setError(err instanceof Error ? err.message : 'Failed to update module progress')
      return null
    }
  }

  const pauseModule = async (moduleName: string) => {
    if (!user?.id) return null

    try {
      const module = modules.find(m => m.module_name === moduleName)
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

  const resumeModule = async (moduleName: string) => {
    if (!user?.id) return null

    try {
      const module = modules.find(m => m.module_name === moduleName)
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

  const getModuleStatus = (moduleName: string): ModuleActivation['status'] => {
    const module = modules.find(m => m.module_name === moduleName)
    return module?.status || 'inactive'
  }

  const getModuleProgress = (moduleName: string): number => {
    const module = modules.find(m => m.module_name === moduleName)
    return module?.progress || 0
  }

  const getActiveModules = () => {
    return modules.filter(m => m.status === 'active')
  }

  const getCompletedModules = () => {
    return modules.filter(m => m.status === 'completed')
  }

  const checkDependencies = (moduleName: string): boolean => {
    // Define module dependencies
    const dependencies: Record<string, string[]> = {
      'Payment Setup': ['Legal Setup'],
      'Business Banking': ['Legal Setup'],
      'Marketing AI': ['Brand Identity', 'Website Builder']
    }

    const requiredModules = dependencies[moduleName] || []
    
    // Check if all required modules are completed
    return requiredModules.every(reqModule => {
      const module = modules.find(m => m.module_name === reqModule)
      return module?.status === 'completed'
    })
  }

  return {
    modules,
    loading,
    error,
    activateModule,
    updateModuleProgress,
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