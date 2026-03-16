import { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user] = useState({ name: 'Admin', role: 'Owner' });

  const value = useMemo(() => ({ user }), [user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
