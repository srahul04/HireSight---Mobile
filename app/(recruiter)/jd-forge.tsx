import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useState } from 'react';
import { LiveService } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function JDForgeScreen() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Senior');
  const [focus, setFocus] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleForge = async () => {
    if (!role || !focus) {
      Alert.alert('Missing Info', 'Explain the role and focus to forge the mission brief.');
      return;
    }
    setLoading(true);
    const forgeData = await LiveService.generateEliteJD(role, level, focus);
    setResult(forgeData);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await LiveService.postJob(user.id, {
          title: result.title,
          type: 'Full-time',
          location: 'Remote',
          description: result.description
        });
        Alert.alert('Mission Posted', 'Your elite job description is live on the grid.');
        router.back();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to publish mission brief.');
    }
    setSaving(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <FontAwesome name="arrow-left" size={18} color="#8B5CF6" />
            </TouchableOpacity>
            <Text className="text-4xl font-bold text-white tracking-tight italic">JD Forge</Text>
            <Text className="text-slate-400 mt-1">Armor your mission with elite intelligence.</Text>
        </Animated.View>

        {!result ? (
            <View className="space-y-6">
                <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">1. Role & Seniority</Text>
                    <TextInput 
                        placeholder="e.g. Lead Cyber Engineer" 
                        placeholderTextColor="#475569"
                        value={role}
                        onChangeText={setRole}
                        className="bg-black/20 border border-slate-800 rounded-3xl p-5 text-white mb-4"
                    />
                    <View className="flex-row gap-2">
                        {['Junior', 'Mid', 'Senior', 'Staff'].map(l => (
                            <TouchableOpacity 
                                key={l}
                                onPress={() => setLevel(l)}
                                className={`flex-1 py-3 rounded-xl border items-center ${level === l ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
                            >
                                <Text className={`text-[10px] font-bold ${level === l ? 'text-white' : 'text-slate-400'}`}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">2. Core Mission Focus</Text>
                    <TextInput 
                        placeholder="Key technologies, projects, or goals..." 
                        placeholderTextColor="#475569"
                        value={focus}
                        onChangeText={setFocus}
                        multiline
                        numberOfLines={4}
                        className="bg-black/20 border border-slate-800 rounded-3xl p-5 text-white h-32"
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleForge}
                    disabled={loading || !role || !focus}
                    className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${loading || !role || !focus ? 'bg-slate-800' : 'bg-indigo-600 shadow-indigo-500/20'}`}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <FontAwesome name="magic" size={20} color="#fff" className="mr-3" />
                            <Text className="text-white font-bold text-lg italic">Forge Mission Brief</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        ) : (
            <Animated.View entering={FadeInDown} className="space-y-6">
                <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Optimized Title</Text>
                    <Text className="text-white font-bold text-2xl mb-6">{result.title}</Text>
                    
                    <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Mission Intelligence</Text>
                    <Text className="text-slate-300 text-sm leading-6">{result.description}</Text>
                    
                    <View className="h-px bg-slate-800 my-6" />
                    
                    <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Strategic Keywords</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {result.keywords?.map((k: string) => (
                            <View key={k} className="bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                <Text className="text-indigo-400 text-[10px] font-bold">{k}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="flex-row gap-4 mb-10">
                    <TouchableOpacity 
                        onPress={() => setResult(null)}
                        className="flex-1 bg-slate-800 h-14 rounded-[20px] items-center justify-center border border-slate-700"
                    >
                        <Text className="text-slate-400 font-bold">Discard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleSave}
                        disabled={saving}
                        className="flex-1 bg-indigo-600 h-14 rounded-[20px] items-center justify-center shadow-lg"
                    >
                        {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Post Mission</Text>}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
