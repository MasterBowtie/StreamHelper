import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AlertContext = createContext(null);

// IDEA Be able to use a custom Alert duration ~500ms
const ALERT_DURATION = 5000;

export function AlertProvider({children}) {
    const [currentAlert, setCurrentAlert] = useState(null);

    const queue = useRef([]);

    const nextAlert = useCallback(()=> {
        if (queue.current.length === 0) {
            setCurrentAlert(null);
            return;
        }

        const next = queue.current.shift();
        setCurrentAlert(next);
    }, []);

    const addAlert = useCallback((alert)=> {
        queue.current.push(alert);

        if (!currentAlert) {
            nextAlert();
        }

    }, [currentAlert, nextAlert]);

    useEffect(()=> {
        if (!currentAlert) {
            return;
        }

        const timer = setTimeout(()=> {
            nextAlert();
        }, ALERT_DURATION);

        return () => clearTimeout(timer);
    }, [currentAlert, nextAlert]);

    return (
        <AlertContext.Provider value={{currentAlert, addAlert}}>
            {children}
        </AlertContext.Provider>
    )
}

export function useAlerts() {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error("useAlerts must be used inside AlertProvider");
    }

    return context;
}