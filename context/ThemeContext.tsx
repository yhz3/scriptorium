import React, { createContext } from 'react';

export const ThemeContext = createContext<{
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
}>({
    theme: '1e1e1e',
    setTheme: () => {},
});