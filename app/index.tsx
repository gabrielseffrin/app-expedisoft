import React, { useState } from "react";
import {Text, TextInput, View, StyleSheet, TouchableOpacity, ActivityIndicator} from "react-native";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Feather } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";

export default function Index() {

    const { signIn } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            alert("Preencha todos os campos!");
            return;
        }

        setLoading(true);
        await signIn(username, password);
        setLoading(false);
    };

    return (
        <ActionSheetProvider>
            <View style={styles.container}>

                <Image
                    source={require('../assets/images/logo-expedisoft.png')}
                    style={styles.logo}
                    contentFit="contain"
                />

                <Text style={styles.title}>Bem-vindo!</Text>

                <View style={styles.cardContainer}>

                    <Text style={styles.label}>usuário</Text>
                    <View style={styles.inputWrapper}>
                        <Feather name="user" size={18} color="#A0A0A0" style={styles.icon} />
                        <TextInput
                            placeholder="Digite seu usuário"
                            placeholderTextColor="#A0A0A0"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <Text style={styles.label}>senha</Text>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={18} color="#A0A0A0" style={styles.icon} />
                        <TextInput
                            placeholder="Digite sua senha"
                            placeholderTextColor="#A0A0A0"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#A0A0A0" />
                        </TouchableOpacity>
                    </View>

                    <Link href={"/recover"} asChild>
                        <TouchableOpacity>
                            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.8}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '75%',
        aspectRatio: 860 / 320,
        marginBottom: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1B143F',
        marginBottom: 30,
    },
    cardContainer: {
        width: '85%',
        backgroundColor: '#E8EDF5',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1B143F',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 20,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    forgotPasswordText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#1B143F',
        borderRadius: 10,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});