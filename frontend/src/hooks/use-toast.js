// hooks/use-toast.js
import { useContext, createContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = "default", duration = 3000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            className={`p-4 rounded-lg shadow-md border bg-white dark:bg-gray-900 ${
              variant === "destructive"
                ? "border-red-500 text-red-700 bg-red-50"
                : "border-gray-200 text-gray-800"
            }`}
          >
            <strong className="block">{title}</strong>
            <p className="text-sm">{description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
