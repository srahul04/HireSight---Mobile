import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ResumeUploader from '../../components/ResumeUploader';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const loadProfileData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      const { data: resumeData } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      
      setProfile(userData);
      setResumes(resumeData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#3B82F6" /></View>;

  return (
    <ScrollView className="flex-1 bg-background p-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.duration(600)} className="items-center mb-12 mt-6">
        <View className="w-28 h-28 bg-slate-900 rounded-full border-4 border-blue-500/20 items-center justify-center mb-5 shadow-2xl">
          <View className="w-20 h-20 rounded-full bg-blue-500/10 items-center justify-center">
            {profile?.avatar_url ? (
              <Text className="text-white text-3xl font-bold">{profile.full_name[0]}</Text>
            ) : (
              <FontAwesome name="user" size={40} color="#3B82F6" />
            )}
          </View>
        </View>
        <Text className="text-3xl font-bold text-white tracking-tight">{profile?.full_name || 'HireSight User'}</Text>
        <Text className="text-slate-500 text-base mt-0.5">{profile?.role === 'job_seeker' ? 'Candidate' : 'Recruiter'}</Text>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200)} className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-5 ml-1">Resume Vault</Animated.Text>
      
      <TouchableOpacity 
        onPress={() => setShowUploader(true)}
        className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-[24px] flex-row items-center justify-center mb-6"
      >
        <FontAwesome name="plus-circle" size={20} color="#3B82F6" className="mr-3" />
        <Text className="text-blue-500 font-bold">Add New Resume</Text>
      </TouchableOpacity>

      <Animated.View entering={FadeInDown.delay(300)} className="bg-slate-900 rounded-[32px] border border-slate-800 p-4 mb-10 shadow-lg">
        {resumes.length > 0 ? (
          resumes.map((resume, index) => (
            <TouchableOpacity 
              key={resume.id} 
              activeOpacity={0.7} 
              className={`flex-row items-center justify-between p-4 ${index !== resumes.length - 1 ? 'border-b border-slate-800/50' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center mr-4">
                    <FontAwesome name="file-text-o" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">{resume.name}</Text>
                  <Text className="text-xs text-slate-500 font-medium">
                    {resume.ats_health_score ? `Score: ${resume.ats_health_score}` : 'Pending Analysis'}
                  </Text>
                </View>
              </View>
              <FontAwesome name="angle-right" size={20} color="#475569" />
            </TouchableOpacity>
          ))
        ) : (
          <View className="p-8 items-center">
             <Text className="text-slate-500 italic">No resumes uploaded yet.</Text>
          </View>
        )}
      </Animated.View>

      <Modal visible={showUploader} animationType="slide" transparent statusBarTranslucent>
        <View className="flex-1 bg-black/80 justify-end">
          <TouchableOpacity className="flex-1" onPress={() => setShowUploader(false)} />
          <View className="bg-slate-950 rounded-t-[40px] p-8 pb-12 border-t border-slate-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-white tracking-tight">Add Resume</Text>
              <TouchableOpacity onPress={() => setShowUploader(false)} className="p-2">
                <FontAwesome name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
            <ResumeUploader onUploadComplete={() => {
              setShowUploader(false);
              loadProfileData();
            }} />
          </View>
        </View>
      </Modal>

      <Animated.View entering={FadeInDown.delay(500)} className="space-y-3">
          <TouchableOpacity 
            onPress={handleSignOut}
            activeOpacity={0.8}
            className="flex-row items-center justify-center p-6 rounded-[24px] bg-red-500/5 border border-red-500/10 mt-4"
          >
            <FontAwesome name="sign-out" size={18} color="#EF4444" className="mr-3" />
            <Text className="text-red-500 font-black uppercase tracking-widest text-xs">Sign Out</Text>
          </TouchableOpacity>
      </Animated.View>
      <View className="h-10" />
    </ScrollView>
  );
}
