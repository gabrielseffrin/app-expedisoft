// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
    const { signOut } = useAuth();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#1B143F',
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                },
                headerTitleAlign: 'center',
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Início',
                    headerTitle: () => (
                        <Image
                            source={require('../../assets/images/logo-expedisoft.png')}
                            style={{ width: 140, height: 40 }}
                            contentFit="contain"
                        />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginLeft: 20 }}>
                            <Feather name="menu" size={26} color="#1B143F" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={{ marginRight: 20 }} onPress={signOut}>
                            <Feather name="log-out" size={24} color="#1B143F" />
                        </TouchableOpacity>
                    ),
                    tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
                }}
            />
            {/* O loadingOrders foi removido daqui! */}
        </Tabs>
    );
}