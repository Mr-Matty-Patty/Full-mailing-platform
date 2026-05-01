import { createContext, useContext, useMemo, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [commandOpen, setCommandOpen] = useState(false);

  function pushToast(message, type = "info") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }

  const value = useMemo(() => ({ toasts, pushToast, commandOpen, setCommandOpen }), [toasts, commandOpen]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}
