import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LiveService } from '../../lib/services';
import { useRouter } from 'expo-router';

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const data = await LiveService.getJobPostings(user.id);
      setJobs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-background p-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(600)} className="flex-row items-center justify-between mb-8 mt-4">
        <View>
          <Text className="text-3xl font-bold text-white tracking-tight">Active Postings</Text>
          <Text className="text-slate-400 mt-1">Manage your corporate roles.</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(recruiter)/jd-forge')}
          activeOpacity={0.8}
          className="w-14 h-14 bg-indigo-500 rounded-2xl items-center justify-center shadow-xl shadow-indigo-500/20"
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} className="bg-slate-900 border border-slate-800 rounded-2xl flex-row items-center px-5 h-14 mb-10 shadow-sm">
        <FontAwesome name="search" size={18} color="#64748B" className="mr-3" />
        <TextInput 
          placeholder="Filter active roles..." 
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-white h-full font-medium"
        />
      </Animated.View>

      {loading ? (
        <ActivityIndicator color="#8B5CF6" />
      ) : (
        <View className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <Animated.View key={job.id} entering={FadeInDown.delay(200 + index * 100)} layout={Layout.springify()}>
                <TouchableOpacity 
                  activeOpacity={0.9}
                  className={`p-6 rounded-[32px] border ${job.is_live ? 'bg-indigo-500/[0.03] border-indigo-500/20' : 'bg-slate-900/50 border-slate-800'}`}
                >
                  <View className="flex-row justify-between mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-xl font-bold text-white mb-1.5">{job.title}</Text>
                        <View className="flex-row items-center">
                            <FontAwesome name="map-marker" size={12} color="#64748B" className="mr-1.5" />
                            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">{job.type} • {job.location}</Text>
                        </View>
                    </View>
                    <View className={`h-7 px-3 rounded-full items-center justify-center ${job.is_live ? 'bg-green-500/10' : 'bg-slate-800'}`}>
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${job.is_live ? 'text-green-500' : 'text-slate-500'}`}>{job.is_live ? 'Active' : 'Draft'}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between border-t border-slate-800/10 pt-5">
                    <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center">
                            <FontAwesome name="users" size={12} color="#94A3B8" />
                        </View>
                        <Text className="text-sm font-bold text-slate-300">New Talent Found</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <Text className="text-indigo-400 font-bold text-sm">Manage</Text>
                        <FontAwesome name="angle-right" size={14} color="#818CF8" />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View className="items-center py-20">
               <Text className="text-slate-500 italic">No roles posted yet.</Text>
            </View>
          )}
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}

