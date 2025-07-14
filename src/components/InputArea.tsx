import { ReactNode } from 'react'
import { ModeToggle } from './ModeToggle'

export type Mode = 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'

interface InputAreaProps {
  mode: Mode
  onModeChange?: (mode: Mode) => void
  children: ReactNode
}

export function InputArea({ mode, onModeChange, children }: InputAreaProps) {
  return (
    <div className="flex-shrink-0">
      <div className="max-w-3xl mx-auto p-4">
        {/* Mode Toggle */}
        {onModeChange && (
          <div className="flex justify-center mb-4">
            <ModeToggle 
              currentMode={mode} 
              onModeChange={onModeChange}
            />
          </div>
        )}
        
        {/* Mode-specific input component */}
        {children}
      </div>
    </div>
  )
}