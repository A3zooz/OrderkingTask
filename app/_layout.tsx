import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/utils/authContext';

// export const unstable_settings = {
//     anchor: '(tabs)',
// };

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AuthProvider>
            <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
                <Stack>
                  <Stack.Screen
                      name="(protected)"
                      options={{ headerShown: false }}
                  />
                    <Stack.Screen
                        name="home"
                        
                    />
                    <Stack.Screen
                        name="signup"
                        
                    />
                    <Stack.Screen
                        name="login"
                    />
                    <Stack.Screen
                        name="forgot-password"
                        
                    />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </AuthProvider>
    );
}
