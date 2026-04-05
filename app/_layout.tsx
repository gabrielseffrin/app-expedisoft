// app/_layout.tsx
import { Stack, router } from "expo-router";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "@/context/AuthContext";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function RootLayout() {
    return (
        <AuthProvider>
            <ActionSheetProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    <Stack.Screen
                        name="loadingOrders"
                        options={{
                            headerShown: true,
                            title: 'Carregamentos',
                            headerTitleAlign: 'center',
                            headerStyle: {
                                backgroundColor: '#FFFFFF',
                            },
                            headerTitleStyle: {
                                color: '#333333',
                                fontSize: 18,
                                fontWeight: '600',
                            },
                            headerLeft: () => (
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                >
                                    <Feather name="arrow-left" size={26} color="#4B5563" />
                                </TouchableOpacity>
                            ),
                        }}
                    />
                </Stack>
            </ActionSheetProvider>
        </AuthProvider>
    );
}