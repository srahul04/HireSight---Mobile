import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LiveService } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CandidateAuditScreen() {
  const { userId, jobId } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
        if (!userId || !jobId) return;
        setLoading(true);
        try {
            const [userRes, jobRes] = await Promise.all([
                supabase.from('users').select('*, resumes(*)').eq('id', userId as string).single(),
                supabase.from('job_postings').select('*').eq('id', jobId as string).single()
            ]);
            
            setData({
                user: userRes.data,
                job: jobRes.data,
                resume: userRes.data?.resumes?.[0]
            });
        } catch (e) {
            Alert.alert('Error', 'Failed to retrieve mission data.');
        }
        setLoading(false);
    }
    fetchData();
  }, [userId, jobId]);

  const handleAudit = async () => {
    if (!data?.resume || !data?.job) {
        Alert.alert('Missing Info', 'Candidate resume or job description not found.');
        return;
    }
    setAuditing(true);
    const result = await LiveService.roastCandidate(data.resume.raw_text, data.job.description);
    setAuditResult(result);
    setAuditing(false);
  };

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#8B5CF6" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <FontAwesome name="arrow-left" size={18} color="#8B5CF6" />
            </TouchableOpacity>
            <Text className="text-4xl font-bold text-white tracking-tight italic">Deep Audit</Text>
            <Text className="text-slate-400 mt-1">Surgical AI evaluation of candidate {data.user?.full_name}.</Text>
        </Animated.View>

        {!auditResult ? (
            <View className="space-y-6">
                <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4">Target Mission</Text>
                    <Text className="text-white font-bold text-xl mb-1">{data.job?.title}</Text>
                    <Text className="text-slate-500 text-xs italic">System matching score: High Intent</Text>
                </View>

                <TouchableOpacity 
                    onPress={handleAudit}
                    className="bg-indigo-600 h-16 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-indigo-500/20"
                >
                    {auditing ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <FontAwesome name="bolt" size={20} color="#fff" className="mr-3" />
                            <Text className="text-white font-bold text-lg">Ignite Deep Audit</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] mt-4">
                    <Text className="text-slate-500 text-xs leading-5">
                       Deep Audit performs a semantic cross-reference between the candidate's historical record and the active mission parameters. 
                       <Text className="text-indigo-400 font-bold"> Warning: Result mode is "Brutally Honest".</Text>
                    </Text>
                </View>
            </View>
        ) : (
            <Animated.View entering={FadeInDown} className="space-y-6">
                <View className="bg-red-500/10 p-6 rounded-[32px] border border-red-500/20">
                    <Text className="text-red-500 font-black text-xs uppercase tracking-widest mb-3">The Roaster</Text>
                    <Text className="text-slate-100 text-base leading-6 italic">"{auditResult.roast}"</Text>
                </View>

                <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Identified Gaps</Text>
                    {auditResult.gaps?.map((gap: string, i: number) => (
                        <View key={i} className="flex-row items-center mb-3">
                            <View className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-3" />
                            <Text className="text-slate-400 text-sm">{gap}</Text>
                        </View>
                    ))}
                </View>

                <View className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 items-center">
                    <Text className="text-slate-500 font-black text-xs uppercase tracking-widest mb-4">Tactical Recommendation</Text>
                    <View className="bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20 mb-4">
                        <Text className="text-indigo-400 font-black text-lg">{auditResult.recommendation.split(' ')[0]}</Text>
                    </View>
                    <Text className="text-slate-400 text-center text-xs leading-5">{auditResult.recommendation}</Text>
                </View>

                <TouchableOpacity 
                    onPress={() => setAuditResult(null)}
                    className="bg-slate-800 h-14 rounded-[20px] items-center justify-center mb-10"
                >
                    <Text className="text-slate-400 font-bold">Close Mission Report</Text>
                </TouchableOpacity>
            </Animated.View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
