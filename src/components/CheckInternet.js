import { useEffect, useState } from 'react';
import { toaster } from './ui/toaster';

export function useStatusInternet() {
    const [userOnline, setUserOnline] = useState(navigator.onLine);

    useEffect(() => {
        const isOffline = () => {
            setUserOnline(false);
        };

        const isOnline = () => {
            setUserOnline(true);
        };

        window.addEventListener('offline', isOffline);
        window.addEventListener('online', isOnline);

        if (!navigator.onLine) {
            isOffline();
        }

        return () => {
            window.removeEventListener('offline', isOffline);
            window.removeEventListener('online', isOnline);
        };
    }, []);

    return userOnline;
}

// Transforme em um componente real
export function CheckInternet() {
    useEffect(() => {
        const ID = "network-offline-toast";
        const GROUP = "network";

        const showToast = () => {
            if (toaster.isVisible(ID)) return;
            toaster.create({
                id: ID,
                title: "Sem conexão :(",
                description: "Você está offline. Por favor, verifique sua conexão com a internet.",
                type: "error",
                duration: Infinity,
                closable: false,
            });
        };

        const closeToast = () => {
            toaster.dismiss(ID);
        };

        const isOffline = () => {
            showToast();
        };

        const isOnline = () => {
            closeToast();
        };

        window.addEventListener('offline', isOffline);
        window.addEventListener('online', isOnline);

        // Verifica o estado inicial
        if (!navigator.onLine) {
            isOffline();
        }

        return () => {
            window.removeEventListener('offline', isOffline);
            window.removeEventListener('online', isOnline);
            closeToast(); // Limpa o toast ao desmontar
        };
    }, []);

    return null;
}