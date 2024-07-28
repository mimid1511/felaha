"use client";

import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedTheme = localStorage.getItem("theme") || "light";
        setTheme(storedTheme);
    }, []);

    if (!isMounted) {
        return <>Loading...</>;
    }

    const changeTheme = () => {
        let newTheme ;
        if (theme == "lemonade") {
            newTheme = "dim";
        }
        else{
            newTheme = "lemonade";
        }
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);    
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
