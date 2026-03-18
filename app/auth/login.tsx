import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { validateLogin } from '@/utils/validation';
import { handleAuthError, logError } from '@/utils/errors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    
    // Validate inputs
    const validation = validateLogin(email, password);
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid input');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setLocalError(errorMessage);
      logError('LoginScreen.handleLogin', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-gray-900"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-white mb-2">
              Game Scoreboard
            </Text>
            <Text className="text-gray-400">
              Track your game scores and climb the leaderboard
            </Text>
          </View>

          {/* Error Message */}
          {(localError || error) && (
            <View className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
              <Text className="text-red-200">
                {localError || error}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`rounded-lg py-3 items-center ${
              isLoading ? 'bg-blue-700 opacity-50' : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-400">Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/signup')}
              disabled={isLoading}
            >
              <Text className="text-blue-400 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
