import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@hiresight_settings';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.notifications ?? true);
          setBiometrics(parsed.biometrics ?? false);
        }
      } catch {}
    }
    loadSettings();
  }, []);

  // Persist whenever toggles change
  const updateSetting = async (key: string, value: boolean) => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const current = stored ? JSON.parse(stored) : {};
      current[key] = value;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
    } catch {}
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    updateSetting('notifications', value);
  };

  const handleBiometricsToggle = (value: boolean) => {
    setBiometrics(value);
    updateSetting('biometrics', value);
    // TODO: Phase 2 — Wire expo-local-authentication for biometric lock
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-10 mt-4">
          <Text className="text-4xl font-bold text-white tracking-tight italic">Terminal Config</Text>
          <Text className="text-slate-400 mt-1">Manage your identity and intelligence settings.</Text>
        </Animated.View>

        <View className="space-y-4 mb-10">
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Systems & Logic</Text>
            
            <SettingItem 
                icon="bell" 
                label="AI Notifications" 
                description="Get alerts for JD matches & score dips"
                value={notifications}
                onValueChange={handleNotificationsToggle}
            />
            
            <SettingItem 
                icon="shield" 
                label="Biometric Security" 
                description="Secure your Resume Vault"
                value={biometrics}
                onValueChange={handleBiometricsToggle}
            />

            <TouchableOpacity 
                onPress={() => router.push('/(candidate)/edit-profile')}
                className="bg-slate-900 p-5 rounded-[32px] border border-slate-800 flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center">
                        <FontAwesome name="user-o" size={16} color="#3B82F6" />
                    </View>
                    <View>
                        <Text className="text-white font-bold text-base">Profile Tuning</Text>
                        <Text className="text-slate-500 text-xs mt-0.5">Edit credentials and role intent</Text>
                    </View>
                </View>
                <FontAwesome name="angle-right" size={16} color="#334155" />
            </TouchableOpacity>
        </View>

        <View className="space-y-4 mb-10">
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Support & Meta</Text>
            
            <TouchableOpacity className="p-5 flex-row items-center justify-between">
                <Text className="text-slate-300 font-bold">Privacy Protocol</Text>
                <FontAwesome name="external-link" size={12} color="#475569" />
            </TouchableOpacity>
            
            <TouchableOpacity className="p-5 flex-row items-center justify-between border-t border-slate-800/10">
                <Text className="text-slate-300 font-bold">Terms of Service</Text>
                <FontAwesome name="external-link" size={12} color="#475569" />
            </TouchableOpacity>

            <View className="p-5 border-t border-slate-800/10">
                <Text className="text-slate-600 text-xs font-mono">HireSight v1.0.0 • Built with Groq AI</Text>
            </View>
        </View>

        <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-500/10 border border-red-500/20 h-16 rounded-[24px] flex-row items-center justify-center mb-20"
        >
            <FontAwesome name="power-off" size={18} color="#EF4444" className="mr-3" />
            <Text className="text-red-500 font-bold text-lg">Deauthenticate</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({ icon, label, description, value, onValueChange }: any) {
    return (
        <View className="bg-slate-900 p-5 rounded-[32px] border border-slate-800 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
                <View className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center">
                    <FontAwesome name={icon} size={16} color="#64748B" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-base">{label}</Text>
                    <Text className="text-slate-500 text-[10px] mt-0.5 uppercase font-medium tracking-tight">{description}</Text>
                </View>
            </View>
            <Switch 
                value={value} 
                onValueChange={onValueChange} 
                trackColor={{ false: '#1e293b', true: '#3b82f6' }}
                thumbColor="#f8fafc"
            />
        </View>
    );
}
