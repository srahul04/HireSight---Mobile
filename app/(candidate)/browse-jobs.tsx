import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LiveService } from '../../lib/services';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BrowseJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    const data = await LiveService.getAllJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.location.toLowerCase().includes(search.toLowerCase()) ||
    j.recruiters?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
             <FontAwesome name="arrow-left" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-white tracking-tight italic">Discovery Pool</Text>
          <Text className="text-slate-400 mt-1">AI-powered matching for your next career jump.</Text>
        </Animated.View>

        <View className="bg-slate-900 border border-slate-800 rounded-2xl flex-row items-center px-5 h-14 mb-10 shadow-sm">
          <FontAwesome name="search" size={18} color="#64748B" className="mr-3" />
          <TextInput 
            placeholder="Search roles, companies, or locations..." 
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-white h-full font-medium"
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#3B82F6" />
        ) : (
          <View className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <Animated.View key={job.id} entering={FadeInDown.delay(index * 100)} layout={Layout.springify()}>
                  <TouchableOpacity 
                    onPress={() => router.push({
                                pathname: '/(candidate)/analyze',
                                params: { 
                                    jdText: job.description, 
                                    company: job.recruiters?.full_name, 
                                    role: job.title,
                                    jobId: job.id
                                }
                            })}
                    activeOpacity={0.9}
                    className="p-6 rounded-[32px] bg-slate-900/50 border border-slate-800"
                  >
                    <View className="flex-row justify-between mb-4">
                      <View className="flex-1 mr-4">
                          <Text className="text-xl font-bold text-white mb-1.5">{job.title}</Text>
                          <Text className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">{job.recruiters?.full_name || 'Verified Company'}</Text>
                          <View className="flex-row items-center">
                              <FontAwesome name="map-marker" size={12} color="#64748B" className="mr-1.5" />
                              <Text className="text-slate-500 text-xs">{job.type} • {job.location}</Text>
                          </View>
                      </View>
                      <View className="w-12 h-12 bg-blue-500/10 rounded-2xl items-center justify-center">
                          <FontAwesome name="bolt" size={20} color="#3B82F6" />
                      </View>
                    </View>
                    
                    <View className="flex-row items-center justify-between border-t border-slate-800/10 pt-4">
                      <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Posted {new Date(job.created_at).toLocaleDateString()}</Text>
                      <View className="flex-row items-center gap-1.5">
                          <Text className="text-blue-500 font-bold text-sm">Deep Scan & Apply</Text>
                          <FontAwesome name="angle-right" size={14} color="#3B82F6" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <View className="items-center py-20">
                 <Text className="text-slate-500 italic">No roles match your search.</Text>
              </View>
            )}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
