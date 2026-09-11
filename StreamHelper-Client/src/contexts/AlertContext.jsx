import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AlertContext = createContext(null);

// IDEA Be able to use a custom Alert duration ~500ms
const ALERT_DURATION = 5000;

export function AlertProvider({children}) {
    const [currentAlert, setCurrentAlert] = useState(null);

    const queue = useRef([]);

    const nextAlert = useCallback(()=> {
        const next = queue.current.shift();
        
        if (!next) {
            setCurrentAlert(null);
            return;
        }
        setCurrentAlert(next);
    }, []);

    const addAlert = useCallback((alert)=> {
        queue.current.push(alert);

        setCurrentAlert(current => {
            if (current !== null) {
                return current;
            }
            return queue.current.shift() ?? null;
        });

    }, []);

    useEffect(()=> {
        if (!currentAlert) {
            return;
        }

        const timer = setTimeout(()=> {
            nextAlert();
        }, currentAlert?.duration ?? ALERT_DURATION);

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