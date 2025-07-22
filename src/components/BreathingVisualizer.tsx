import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'

interface BreathingVisualizerProps {
  isActive: boolean
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale' | 'pause') => void
}

export default function BreathingVisualizer({ isActive, onPhaseChange }: BreathingVisualizerProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('pause')
  const [count, setCount] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setPhase('pause')
      setCount(0)
      return
    }

    const interval = setInterval(() => {
      setCount(prev => {
        const newCount = prev + 1
        
        // 4-4-6-2 breathing pattern (inhale-hold-exhale-pause)
        if (newCount <= 4) {
          const newPhase = 'inhale'
          if (phase !== newPhase) {
            setPhase(newPhase)
            onPhaseChange?.(newPhase)
          }
        } else if (newCount <= 8) {
          const newPhase = 'hold'
          if (phase !== newPhase) {
            setPhase(newPhase)
            onPhaseChange?.(newPhase)
          }
        } else if (newCount <= 14) {
          const newPhase = 'exhale'
          if (phase !== newPhase) {
            setPhase(newPhase)
            onPhaseChange?.(newPhase)
          }
        } else if (newCount <= 16) {
          const newPhase = 'pause'
          if (phase !== newPhase) {
            setPhase(newPhase)
            onPhaseChange?.(newPhase)
          }
        } else {
          setCycle(prev => prev + 1)
          return 0
        }
        
        return newCount
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase, onPhaseChange])

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 'scale-150'
      case 'hold': return 'scale-150'
      case 'exhale': return 'scale-75'
      case 'pause': return 'scale-100'
    }
  }

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale': return 'bg-blue-400'
      case 'hold': return 'bg-purple-400'
      case 'exhale': return 'bg-green-400'
      case 'pause': return 'bg-gray-300'
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In'
      case 'hold': return 'Hold'
      case 'exhale': return 'Breathe Out'
      case 'pause': return 'Rest'
    }
  }

  const getPhaseCount = () => {
    switch (phase) {
      case 'inhale': return count
      case 'hold': return count - 4
      case 'exhale': return count - 8
      case 'pause': return count - 14
    }
  }

  const getPhaseTotal = () => {
    switch (phase) {
      case 'inhale': return 4
      case 'hold': return 4
      case 'exhale': return 6
      case 'pause': return 2
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Breathing Circle */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div 
              className={`w-32 h-32 rounded-full transition-all duration-1000 ease-in-out ${getCircleColor()} ${getCircleScale()} opacity-80`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white font-medium">
                <div className="text-lg">{getPhaseText()}</div>
                {isActive && (
                  <div className="text-2xl font-bold">
                    {getPhaseCount()}/{getPhaseTotal()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phase Instructions */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              {getPhaseText()}
            </h3>
            {isActive && (
              <div className="space-y-1">
                <p className="text-gray-600">
                  {phase === 'inhale' && 'Fill your lungs slowly and deeply'}
                  {phase === 'hold' && 'Hold your breath gently'}
                  {phase === 'exhale' && 'Release slowly through your mouth'}
                  {phase === 'pause' && 'Rest and prepare for the next breath'}
                </p>
                <p className="text-sm text-gray-500">
                  Cycle {cycle + 1} • Count: {getPhaseCount()}/{getPhaseTotal()}
                </p>
              </div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            {[...Array(getPhaseTotal())].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < getPhaseCount() ? getCircleColor() : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}