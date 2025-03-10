// components/theme-provider.jsx
"use client";

import * as React from "react";

// Create context
const ThemeContext = React.createContext({
  theme: "light",
  setTheme: () => null,
});

// ThemeProvider component
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
}) {
  // Check for saved theme in localStorage or use default
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) || defaultTheme;
    }
    return defaultTheme;
  });

  // Update theme in localStorage and apply class to document element
  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class and add new one
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, theme);
    }
  }, [theme, storageKey]);
  
  // Create memoized value
  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme) => setTheme(newTheme),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};