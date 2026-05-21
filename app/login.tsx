import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Show the exact error from Supabase (includes status codes + reason)
        Alert.alert(
          'Login Failed',
          `${error.message}${error.status ? ` (status ${error.status})` : ''}`,
        );
      } else {
        // Fetch role from public.users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (userData?.role === 'recruiter') {
            router.replace('/(recruiter)/dashboard');
          } else {
            router.replace('/(candidate)/dashboard');
          }
        } else {
          router.replace('/(candidate)/dashboard');
        }
      }
    } catch (e: any) {
      // Catches raw network errors (fetch failures, DNS errors, timeouts)
      Alert.alert(
        'Network Error',
        `Could not reach the server.\n\nDetails: ${e?.message ?? String(e)}\n\nCheck your internet connection and ensure the Supabase project is active.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        <Animated.View entering={FadeInUp.duration(600)} className="space-y-8">
            <View className="items-center mb-8">
                <View className="w-20 h-20 bg-blue-600/10 rounded-3xl items-center justify-center mb-6">
                    <FontAwesome name="lock" size={40} color="#3B82F6" />
                </View>
                <Text className="text-4xl font-extrabold text-white tracking-tighter italic">Welcome Back</Text>
                <Text className="text-slate-500 mt-2">Sign in to continue your journey.</Text>
            </View>

            <View className="space-y-6">
                <View className="space-y-2">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</Text>
                    <TextInput 
                        value={email}
                        onChangeText={setEmail}
                        placeholder="example@email.com"
                        placeholderTextColor="#475569"
                        autoCapitalize="none"
                        className="bg-slate-900 border border-slate-800 text-white h-14 rounded-2xl px-5"
                    />
                </View>

                <View className="space-y-2">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</Text>
                    <TextInput 
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#475569"
                        secureTextEntry
                        className="bg-slate-900 border border-slate-800 text-white h-14 rounded-2xl px-5"
                    />
                </View>

                <TouchableOpacity 
                    onPress={signInWithEmail}
                    disabled={loading}
                    className="h-16 bg-blue-600 rounded-2xl items-center justify-center shadow-2xl shadow-blue-500/20 mt-4"
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-6">
                <Text className="text-slate-500">Don't have an account? </Text>
                <Link href="/signup">
                    <Text className="text-blue-500 font-bold">Sign Up</Text>
                </Link>
            </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
