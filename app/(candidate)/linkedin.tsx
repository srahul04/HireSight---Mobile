import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { LiveService } from '../../lib/services'; // Centralized — no direct groq calls
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

export default function LinkedInOptimizerScreen() {
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleOptimize = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const res = await LiveService.optimizeLinkedIn(profile);
      setResult(res);
    } catch (e) {
      Alert.alert('Error', 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const handleCopyHeadline = async () => {
    if (result?.headline) {
      await Clipboard.setStringAsync(result.headline);
      Alert.alert('Copied!', 'Elite headline copied to clipboard.');
    }
  };

  const handleCopySummary = async () => {
    if (result?.summary) {
      await Clipboard.setStringAsync(result.summary);
      Alert.alert('Copied!', 'Elite summary copied to clipboard.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
          <Text className="text-4xl font-bold text-white tracking-tight italic">Profile Forge</Text>
          <Text className="text-slate-400 mt-1">LinkedIn optimization with surgical AI precision.</Text>
        </Animated.View>

        {!result ? (
          <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
            <Text className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Paste Your Profile Content</Text>
            <TextInput
              value={profile}
              onChangeText={setProfile}
              multiline
              placeholder="Headline, About section, or Experience list..."
              placeholderTextColor="#475569"
              className="h-60 bg-black/20 border border-slate-800 rounded-3xl p-5 text-slate-300 font-mono text-xs leading-5 mb-6"
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={handleOptimize}
              disabled={loading || !profile}
              className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${loading || !profile ? 'bg-slate-800' : 'bg-blue-600'}`}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <FontAwesome name="linkedin" size={20} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-3">Analyze Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-6">
            <Animated.View entering={FadeInDown} className="bg-red-500/10 p-6 rounded-[32px] border border-red-500/20">
              <Text className="text-red-500 font-black text-xs uppercase tracking-widest mb-3">The Brutal Roast</Text>
              <Text className="text-slate-300 text-sm leading-6 italic">"{result.roast}"</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-blue-500 font-black text-xs uppercase tracking-widest">Elite Headline</Text>
                <TouchableOpacity onPress={handleCopyHeadline} className="flex-row items-center gap-2">
                  <FontAwesome name="copy" size={12} color="#3B82F6" />
                  <Text className="text-blue-500 text-xs font-bold">Copy</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-white font-bold text-lg">{result.headline}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-blue-500 font-black text-xs uppercase tracking-widest">Elite Summary</Text>
                <TouchableOpacity onPress={handleCopySummary} className="flex-row items-center gap-2">
                  <FontAwesome name="copy" size={12} color="#3B82F6" />
                  <Text className="text-blue-500 text-xs font-bold">Copy</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-slate-300 text-sm leading-6">{result.summary}</Text>
            </Animated.View>

            {/* TODO: Phase 3 — Add "Share as PDF" export for LinkedIn optimization report */}

            <TouchableOpacity
              onPress={() => setResult(null)}
              className="bg-slate-800 h-14 rounded-[24px] items-center justify-center mb-10"
            >
              <Text className="text-slate-400 font-bold">Try Another Audit</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
