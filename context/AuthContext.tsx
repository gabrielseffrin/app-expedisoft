import React, {createContext, useContext, useState, useEffect} from 'react';
import {useRouter, usePathname, useRootNavigationState} from 'expo-router';
import {authService} from "@/services/auth.service";
import * as SecureStore from 'expo-secure-store';
import {is} from "@babel/types";

interface User {
    id: string;
    name: string;
    email: string;
    rule: string;
}

const AuthContext = createContext<any>(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(true);

    const pathname = usePathname();
    const router = useRouter();

    const rootNavigationState = useRootNavigationState();

    useEffect(() => {

        async function loadUser() {
            try {
                const token = await SecureStore.getItemAsync('token');
                if (token) {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
                //await SecureStore.deleteItemAsync('token');
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    useEffect(() => {

        if (!rootNavigationState?.key || isLoading) return;

        const inLoginScreen = pathname === '/';

        if (!user && !inLoginScreen) {
            router.replace('/');
        } else if (user && inLoginScreen) {
            router.replace('/home');
        }
    }, [user, router, pathname, rootNavigationState?.key, isLoading]);

    const signIn = async (username: string, password: string) => {
        try {

            const {token} = await authService.login({email: username, password});
            await SecureStore.setItemAsync('token', token);
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error: any) {
            if (error.response) {
                console.log("Status do Erro:", error.response.status);
                console.log("Resposta do Laravel:", JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                console.log("Erro de Rede (Sem resposta):", error.message);
            } else {
                console.log("Erro interno:", error.message);
            }

            alert("Falha no login. Olhe o terminal do Expo!");
        }
    };

    const signOut = async () => {
        try {
            await authService.logout();
            await SecureStore.deleteItemAsync('token');
            setUser(null);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <AuthContext.Provider value={{user, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    );
}