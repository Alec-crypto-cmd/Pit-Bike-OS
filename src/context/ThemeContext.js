import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to 'dark' for that premium feel initially
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const colors = {
        light: {
            background: '#ffffff',
            text: '#0f172a',
            primary: '#0ea5e9', // Sky 500
            card: '#f1f5f9',
            border: '#e2e8f0',
        },
        dark: {
            background: '#0f172a', // Slate 900
            text: '#f8fafc',
            primary: '#38bdf8', // Sky 400
            card: '#1e293b',
            border: '#334155',
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors: colors[theme] }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
