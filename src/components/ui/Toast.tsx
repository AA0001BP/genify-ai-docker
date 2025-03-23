'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  
  const toast = useCallback(({ duration = 5000, ...props }: ToastProps) => {
    const id = Date.now();
    
    setToasts((prevToasts) => [...prevToasts, { id, duration, ...props }]);
    
    setTimeout(() => {
      setToasts((prevToasts) => 
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, duration);
  }, []);
  
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      <div className="fixed bottom-0 right-0 p-4 mb-4 mr-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => 
              setToasts((prevToasts) => 
                prevToasts.filter((t) => t.id !== toast.id)
              )
            }
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

function Toast({
  title,
  description,
  variant = 'default',
  onClose,
}: ToastProps & { onClose: () => void }) {
  return (
    <div
      className={cn(
        'max-w-md animate-in fade-in slide-in-from-bottom-4 pointer-events-auto flex w-full items-center justify-between space-x-4 rounded-md border p-6 shadow-lg transition-all',
        variant === 'default' 
          ? 'bg-background border-border' 
          : 'border-destructive bg-destructive text-destructive-foreground'
      )}
    >
      <div className="grid gap-1">
        {title && <h4 className="font-medium leading-none tracking-tight">{title}</h4>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className={cn(
          'rounded-md p-1 transition-colors',
          variant === 'default'
            ? 'text-muted-foreground hover:bg-muted'
            : 'text-destructive-foreground hover:bg-destructive/90'
        )}
      >
        <span className="sr-only">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
} 