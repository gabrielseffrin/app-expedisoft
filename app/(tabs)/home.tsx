// app/home.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useAuth} from '@/context/AuthContext';
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Feather} from "@expo/vector-icons";
import {router} from "expo-router";

export default function Home() {
    const {user} = useAuth();

    return (
        <ActionSheetProvider>
            <View style={styles.container}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.title}>Olá, {user?.name}!</Text>
                    <Text style={styles.subtitle}>Módulos disponíveis</Text>
                </View>

                <View>

                    <TouchableOpacity onPress={() => {
                        router.push('/loadingOrders');
                    }}>
                    <Card style={{width: '100%', marginBottom: 20}}>
                        <CardHeader style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                            <View style={{width: 60, height: 60, borderRadius: 15, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center'}}>
                                <Feather name="truck" size={25} color="white"/>
                            </View>
                            <CardTitle>Carregamentos</CardTitle>
                        </CardHeader>
                        <CardFooter>
                                <CardDescription>Acompanhe suas ordens de carregamento em tempo real.</CardDescription>
                        </CardFooter>
                    </Card>
                    </TouchableOpacity>
                </View>

            </View>
        </ActionSheetProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB',
        padding: 20,
    },
    welcomeContainer: {
        marginBottom: 20,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B143F',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
    },
    logoutButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});