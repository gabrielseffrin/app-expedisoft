// app/_layout.tsx
import {Stack} from "expo-router";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import {AuthProvider} from "@/context/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <ActionSheetProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                />
            </ActionSheetProvider>
        </AuthProvider>
    );
}
