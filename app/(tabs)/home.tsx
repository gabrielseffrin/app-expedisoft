// app/home.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAuth} from '@/context/AuthContext';
import {ActionSheetProvider} from "@expo/react-native-action-sheet";

export default function Home() {
    const {user} = useAuth();

    return (
        <ActionSheetProvider>
            <View style={styles.container}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.title}>Olá, {user?.name}!</Text>
                    <Text style={styles.subtitle}>O que deseja fazer hoje?</Text>
                </View>
                <View>
                    <Text>Aqui vai ter a opção de selecionar qual função fazer</Text>
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
        marginBottom: 10,
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