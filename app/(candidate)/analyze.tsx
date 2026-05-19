import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LiveService } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInUp, ZoomIn, Layout, FadeInDown } from 'react-native-reanimated';

export default function AnalyzeScreen() {
  const params = useLocalSearchParams();
  
  const [jd, setJd] = useState((params.jdText as string) || '');
  const [company, setCompany] = useState((params.company as string) || '');
  const [role, setRole] = useState((params.role as string) || '');
  const [jobId, setJobId] = useState((params.jobId as string) || null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('resumes').select('*').eq('user_id', user.id);
        setResumes(data || []);
        if (data && data.length > 0) {
          const defaultRes = data.find(r => r.is_default) || data[0];
          setSelectedResumeId(defaultRes.id);
        }
      }
    }
    fetchResumes();
  }, []);

  const handleAnalyze = async () => {
    if (!jd) return;
    if (!selectedResumeId) {
      Alert.alert('No Resume Found', 'Please upload a resume in your Profile section first.');
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      const resumeText = selectedResume?.raw_text || '';

      const res = await LiveService.analyzeJD(resumeText, jd);
      setResult(res);

      // Persist to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user && res.score > 0) {
        await supabase.from('applications').insert({
          user_id: user.id,
          job_id: jobId,
          resume_id: selectedResumeId,
          company_name: company || 'Unknown Company',
          role: role || 'Unknown Role',
          job_description: jd,
          ats_score: res.score,
          status: 'ready',
          interview_tips: res.feedback
        });
      }
    } catch (error) {
       Alert.alert('Error', 'Analysis encountered a problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.duration(600)} className="mb-8 mt-4">
        <Text className="text-3xl font-bold text-white tracking-tight italic">AI Analyzer</Text>
        <Text className="text-slate-400 mt-1">Crush filters with semantic deep scans.</Text>
      </Animated.View>

      {resumes.length > 0 && (
        <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3">Select Active Resume</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
             {resumes.map(r => (
               <TouchableOpacity 
                key={r.id}
                onPress={() => setSelectedResumeId(r.id)}
                className={`px-4 py-2 rounded-xl border ${selectedResumeId === r.id ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-800'}`}
               >
                 <Text className={`text-xs font-bold ${selectedResumeId === r.id ? 'text-white' : 'text-slate-400'}`}>{r.name}</Text>
               </TouchableOpacity>
             ))}
          </ScrollView>
        </View>
      )}

      <Animated.View layout={Layout.springify()} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 mb-8 shadow-2xl">
        <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center mr-4">
                <FontAwesome name="search" size={18} color="#3B82F6" />
            </View>
            <Text className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Job Description</Text>
        </View>

        <View className="space-y-4 mb-6">
            <View>
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Company Name</Text>
                <TextInput 
                    value={company}
                    onChangeText={setCompany}
                    placeholder="e.g. Google"
                    placeholderTextColor="#475569"
                    className="bg-black/20 border border-slate-800 rounded-2xl h-12 px-5 text-white"
                />
            </View>
            <View>
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Target Role</Text>
                <TextInput 
                    value={role}
                    onChangeText={setRole}
                    placeholder="e.g. Software Engineer"
                    placeholderTextColor="#475569"
                    className="bg-black/20 border border-slate-800 rounded-2xl h-12 px-5 text-white"
                />
            </View>
        </View>

        <TextInput 
          value={jd}
          onChangeText={setJd}
          placeholder="Paste full JD or job link here..."
          placeholderTextColor="#475569"
          multiline
          textAlignVertical="top"
          className="h-48 bg-black/20 border border-slate-800 rounded-2xl p-5 text-slate-200 font-mono text-xs leading-5"
        />
        
        <TouchableOpacity 
          onPress={handleAnalyze}
          disabled={loading || !jd}
          activeOpacity={0.8}
          className={`mt-6 h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${loading || !jd ? 'bg-slate-800' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome name="bolt" size={20} color={jd ? "#fbbf24" : "#475569"} className="mr-3" />
              <Text className="text-white font-bold text-lg">Run Deep Scan</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {result && (
        <Animated.View entering={ZoomIn.duration(600)} className="mb-10">
          <View className="bg-slate-900 p-8 rounded-[40px] border border-blue-500/20 items-center shadow-2xl">
            <View className="w-40 h-40 rounded-full bg-blue-500/5 items-center justify-center mb-6 border-[12px] border-white/5">
                <Text className="text-5xl font-black text-white italic">{result.score}%</Text>
                <Text className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">ATS MATCH</Text>
            </View>
            <Text className="text-2xl font-bold text-white mb-3 text-center">{result.verdict}</Text>
            <View className="h-px w-20 bg-slate-800 mb-6" />
            
            <View className="w-full space-y-4">
               {result.misconceptions?.length > 0 && (
                 <View>
                    <Text className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 ml-1">Critical Misconceptions</Text>
                    {result.misconceptions.map((m: string, i: number) => (
                      <View key={i} className="flex-row items-start mb-2 bg-red-400/5 p-3 rounded-xl border border-red-400/10">
                         <FontAwesome name="warning" size={12} color="#F87171" className="mt-1 mr-3" />
                         <Text className="text-slate-300 text-xs flex-1 leading-4">{m}</Text>
                      </View>
                    ))}
                 </View>
               )}

               <View className="mt-4">
                  <Text className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 ml-1">Hiring Specialist Feedback</Text>
                  <Text className="text-slate-400 text-sm italic leading-5 px-1">{result.feedback}</Text>
               </View>

               {/* Phase 3: Keyword Analysis Provision */}
               <View className="mt-6 border-t border-slate-800/30 pt-6">
                  <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Semantic Keyword Analysis</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <View className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                      <Text className="text-[10px] text-slate-400 font-bold italic">Provision: Keyword Gap Visualization coming soon</Text>
                    </View>
                  </View>
               </View>

               <View className="mt-10 space-y-3">
                  <TouchableOpacity 
                    onPress={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user && jobId) {
                        const success = await LiveService.applyToJob(user.id, jobId as string, selectedResumeId!, result.score, { company, title: role, description: jd });
                        if (success) Alert.alert('Success', 'Application successfully synced with recruiter portal!');
                      } else {
                        Alert.alert('Manual Action Required', 'Copy your tailored resume and apply via the company portal.');
                      }
                    }}
                    className="bg-blue-600 h-14 rounded-2xl flex-row items-center justify-center"
                  >
                    <FontAwesome name="send" size={16} color="white" className="mr-3" />
                    <Text className="text-white font-bold">Apply for Role</Text>
                  </TouchableOpacity>

                  <View className="flex-row gap-3">
                    <TouchableOpacity 
                      onPress={() => Alert.alert('Salary Intelligence', 'AI-powered salary estimation is being calibrated for this region.')}
                      className="flex-1 bg-slate-800 h-14 rounded-2xl flex-row items-center justify-center"
                    >
                      <FontAwesome name="dollar" size={14} color="#94A3B8" className="mr-2" />
                      <Text className="text-slate-300 font-bold text-xs">Salary Intel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => Alert.alert('JD Forge', 'Cover Letter generation provision is ready for Phase 3 integration.')}
                      className="flex-1 bg-slate-800 h-14 rounded-2xl flex-row items-center justify-center"
                    >
                      <FontAwesome name="file-text-o" size={14} color="#94A3B8" className="mr-2" />
                      <Text className="text-slate-300 font-bold text-xs">Forge Letter</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>
          </View>
        </Animated.View>
      )}
      
      <View className="h-10" />
    </ScrollView>
  );
}
