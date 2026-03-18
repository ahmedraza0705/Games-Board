import 'expo-router/entry';
import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen
              name="(tabs)"
              options={{
                animationEnabled: false,
              }}
            />
          ) : (
            <Stack.Screen
              name="auth"
              options={{
                animationEnabled: false,
              }}
            />
          )}
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
