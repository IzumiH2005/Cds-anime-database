// Adapté de shadcn/ui (https://ui.shadcn.com/docs/components/toast)
import { useState, useEffect } from 'react';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

let id = 0;
const genId = () => `toast-${++id}`;

interface UseToastReturn {
  toasts: Toast[];
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fonction pour ajouter un toast
  const toast = (options: ToastOptions) => {
    const newToast: Toast = {
      id: genId(),
      title: options.title,
      description: options.description,
      type: options.type || 'default',
      duration: options.duration || 5000,  // 5 secondes par défaut
      action: options.action,
      onDismiss: options.onDismiss
    };

    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (newToast.duration) {
      setTimeout(() => {
        dismiss(newToast.id);
      }, newToast.duration);
    }

    return newToast.id;
  };

  // Fonction pour retirer un toast
  const dismiss = (id: string) => {
    // Trouver le toast pour exécuter son onDismiss si nécessaire
    const toastToDismiss = toasts.find(t => t.id === id);
    
    if (toastToDismiss?.onDismiss) {
      toastToDismiss.onDismiss();
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fonction pour retirer tous les toasts
  const clear = () => {
    // Exécuter onDismiss pour chaque toast si nécessaire
    toasts.forEach(toast => {
      if (toast.onDismiss) {
        toast.onDismiss();
      }
    });
    
    setToasts([]);
  };

  return { toasts, toast, dismiss, clear };
}