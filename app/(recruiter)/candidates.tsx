import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LiveService } from '../../lib/services';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function CandidatesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'applicants' | 'global'>('applicants');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCandidates = async () => {
    setLoading(true);
    try {
      if (tab === 'global') {
        const data = await LiveService.getGlobalCandidates();
        setCandidates(data.map(u => ({
          id: u.id,
          name: u.full_name,
          role: u.role === 'job_seeker' ? 'Candidate' : 'Recruiter',
          email: u.email,
          score: Math.floor(Math.random() * 40) + 60 // Mock discovery score
        })));
      } else {
        // Fetch specific applicants (simplified logic)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: jobs } = await supabase.from('job_postings').select('id').eq('recruiter_id', user.id);
            const jobIds = jobs?.map(j => j.id) || [];
            if (jobIds.length > 0) {
                const { data: apps } = await supabase
                    .from('applications')
                    .select('*, users(*)')
                    .in('job_id', jobIds);
                
                setCandidates(apps?.map(a => ({
                    id: a.id,
                    name: a.users.full_name,
                    role: a.role,
                    email: a.users.email,
                    score: a.ats_score
                })) || []);
            } else {
                setCandidates([]);
            }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCandidates();
  }, [tab]);

  const filtered = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView className="flex-1 bg-background p-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
        <Text className="text-3xl font-bold text-white tracking-tight">Talent Ecosystem</Text>
        <Text className="text-slate-400 mt-1">Discover and manage candidates with AI intent.</Text>
      </Animated.View>

      <View className="flex-row bg-slate-900 rounded-2xl p-1 mb-6 border border-slate-800">
        <TouchableOpacity 
          onPress={() => setTab('applicants')}
          className={`flex-1 py-3 items-center rounded-xl ${tab === 'applicants' ? 'bg-indigo-600' : ''}`}
        >
          <Text className={`font-bold ${tab === 'applicants' ? 'text-white' : 'text-slate-500'}`}>Applicants</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTab('global')}
          className={`flex-1 py-3 items-center rounded-xl ${tab === 'global' ? 'bg-indigo-600' : ''}`}
        >
          <Text className={`font-bold ${tab === 'global' ? 'text-white' : 'text-slate-500'}`}>Global Pool</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-slate-900 border border-slate-800 rounded-2xl flex-row items-center px-5 h-14 mb-8">
        <FontAwesome name="search" size={16} color="#64748B" className="mr-3" />
        <TextInput 
          placeholder="Search by name or skill..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-white h-full"
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#8B5CF6" />
      ) : (
        <View className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)} layout={Layout.springify()}>
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/(recruiter)/candidate-audit',
                    params: { 
                      name: item.name, 
                      role: item.role, 
                      score: item.score,
                      // In a real app, we'd pass the actual resume text here
                      resumeText: "Candidate resume content from storage..." 
                    }
                  })}
                  activeOpacity={0.8}
                  className="bg-slate-900/50 border border-slate-800 p-5 rounded-[32px] flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-12 h-12 bg-indigo-500/10 rounded-2xl items-center justify-center mr-4">
                        <Text className="text-indigo-400 font-bold text-lg">{item.name[0]}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-base truncate" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-slate-500 text-xs mt-0.5" numberOfLines={1}>{item.role}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className={`px-3 py-1 rounded-full ${item.score > 85 ? 'bg-green-500/10' : 'bg-indigo-500/10'}`}>
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${item.score > 85 ? 'text-green-500' : 'text-indigo-400'}`}>{item.score}% Match</Text>
                    </View>
                    <Text className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">Status: Pending</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View className="items-center py-20">
               <FontAwesome name="search-minus" size={40} color="#334155" className="mb-4" />
               <Text className="text-slate-500 italic">No candidates found in {tab}.</Text>
            </View>
          )}
        </View>
      )}
      <View className="h-20" />
    </ScrollView>
  );
}

