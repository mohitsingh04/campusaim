// import { createContext, useState, useContext } from "react";

// const ActiveTimeContext = createContext();

// export const ActiveTimeProvider = ({ children }) => {
//     const [activeTime, setActiveTime] = useState(0);
//     return (
//         <ActiveTimeContext.Provider value={{ activeTime, setActiveTime }}>
//             {children}
//         </ActiveTimeContext.Provider>
//     );
// };

// export const useActiveTime = () => useContext(ActiveTimeContext);
import React, { createContext, useContext, useState, useEffect } from "react";

const ActiveTimeContext = createContext();

export const ActiveTimeProvider = ({ children }) => {
    const [activeTime, setActiveTime] = useState(() => {
        const saved = localStorage.getItem("activeTime");
        return saved ? parseInt(saved, 10) : 0;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTime(prev => {
                const newTime = prev + 1;
                localStorage.setItem("activeTime", newTime);
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ActiveTimeContext.Provider value={{ activeTime, setActiveTime }}>
            {children}
        </ActiveTimeContext.Provider>
    );
};

export const useActiveTime = () => useContext(ActiveTimeContext);
