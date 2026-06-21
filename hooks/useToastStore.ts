import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  tabId?: string;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts.slice(-2),
        {
          ...toast,
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        },
      ],
    })),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
