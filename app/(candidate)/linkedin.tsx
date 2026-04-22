import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { groq } from '../../lib/ai';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LinkedInOptimzerScreen() {
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleOptimize = async () => {
    if (!profile) return;
    setLoading(true);
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a LinkedIn Branding Expert. 
Analyze the user's current profile/summary and provide:
1. A "Brutal Roast": Point out why it fails to attract recruiters.
2. An "Elite Headline": A high-impact, keyword-rich headline.
3. An "Elite Summary": A 3-paragraph summary using the "First Person" and "Action-Oriented" style.

Return JSON:
{
  "roast": "string",
  "headline": "string",
  "summary": "string"
}`
                },
                {
                    role: 'user',
                    content: `CURRENT PROFILE CONTENT:\n${profile}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        setResult(JSON.parse(completion.choices[0].message.content || '{}'));
    } catch (e) {
        Alert.alert('Error', 'Analysis failed.');
    }
    setLoading(false);
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
                />
                <TouchableOpacity 
                    onPress={handleOptimize}
                    disabled={loading || !profile}
                    className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${loading || !profile ? 'bg-slate-800' : 'bg-blue-600'}`}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <FontAwesome name="linkedin" size={20} color="#fff" className="mr-3" />
                            <Text className="text-white font-bold text-lg">Analyze Profile</Text>
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
                    <Text className="text-blue-500 font-black text-xs uppercase tracking-widest mb-3">Elite Headline</Text>
                    <Text className="text-white font-bold text-lg">{result.headline}</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-blue-500 font-black text-xs uppercase tracking-widest mb-3">Elite Summary</Text>
                    <Text className="text-slate-300 text-sm leading-6">{result.summary}</Text>
                </Animated.View>

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
