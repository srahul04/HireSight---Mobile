import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { LiveService } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApplicationTrackerScreen() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setApps(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'interview': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
          <Text className="text-4xl font-bold text-white tracking-tight italic">Mission Log</Text>
          <Text className="text-slate-400 mt-1">Track your progress across the intelligence grid.</Text>
        </Animated.View>

        {loading ? (
            <ActivityIndicator color="#3B82F6" />
        ) : (
            <View className="space-y-4">
                {apps.length > 0 ? apps.map((app, index) => (
                    <Animated.View key={app.id} entering={FadeInDown.delay(index * 100)} layout={Layout.springify()}>
                        <TouchableOpacity 
                            onPress={() => Alert.alert(`Intelligence: ${app.role}`, app.interview_tips || 'System analysis pending.')}
                            activeOpacity={0.8}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex-row items-center justify-between"
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-white font-bold text-lg mb-1">{app.company_name}</Text>
                                <Text className="text-slate-500 text-xs mb-3">{app.role}</Text>
                                <View className="flex-row items-center gap-3">
                                    <View className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(app.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <TouchableOpacity 
                                      onPress={() => Alert.alert('AI Deep Scan Insights', app.interview_tips || 'Semantic feedback is stored in your vault.')}
                                      className="bg-blue-500/10 px-2 py-1 rounded-lg"
                                    >
                                      <Text className="text-[9px] text-blue-400 font-black uppercase">View Insights</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            <View className="items-end">
                                <View className="mb-2" style={{ backgroundColor: `${getStatusColor(app.status)}15`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWeight: 1, borderColor: `${getStatusColor(app.status)}30` }}>
                                    <Text style={{ color: getStatusColor(app.status) }} className="text-[10px] font-black uppercase tracking-widest">
                                        {app.status}
                                    </Text>
                                </View>
                                <Text className="text-2xl font-black text-white italic">{app.ats_score}%</Text>
                                <Text className="text-[9px] text-slate-600 uppercase font-bold">ATS Score</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )) : (
                    <View className="items-center py-20">
                        <FontAwesome name="folder-open-o" size={40} color="#334155" className="mb-4" />
                        <Text className="text-slate-500 italic">No historical traces detected.</Text>
                    </View>
                )}
            </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
