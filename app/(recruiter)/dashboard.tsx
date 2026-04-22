import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LiveService } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeInRight, FadeInUp, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RecruiterDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const liveStats = await LiveService.getRecruiterStats(user.id);
        
        // Fetch real applicants/candidates for this recruiter
        const { data: jobs } = await supabase.from('job_postings').select('id').eq('recruiter_id', user.id);
        const jobIds = jobs?.map(j => j.id) || [];
        
        let liveActivity: any[] = [];
        if (jobIds.length > 0) {
            const { data } = await supabase
               .from('applications')
               .select('*, users(*)')
               .in('job_id', jobIds)
               .order('created_at', { ascending: false })
               .limit(5);
            liveActivity = data || [];
        }

        setStats(liveStats);
        setActivity(liveActivity.map((a: any) => ({
            id: a.id,
            title: a.users.full_name,
            subtitle: a.role,
            status: `${a.ats_score}% Match`,
            userId: a.user_id,
            jobId: a.job_id
        })));

        // Generate mock hiring velocity history (or real data if available)
        setHistory([65, 78, 45, 90, 85, 95, 88]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#8B5CF6" /></View>;
  if (!stats) return <View className="flex-1 bg-background items-center justify-center"><Text className="text-white">Recruiter session invalid.</Text></View>;

  return (
    <ScrollView className="flex-1 bg-background p-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.duration(600)} className="mb-8 mt-4">
        <Text className="text-4xl font-bold text-white italic tracking-tighter">Mission Admin</Text>
        <Text className="text-slate-400 mt-1 text-base">You have {stats.activeJobs} active deployments across the grid.</Text>
      </Animated.View>

      <View className="flex-row flex-wrap justify-between gap-y-4 mb-10">
        <StatCard icon="briefcase" label="Active Jobs" value={stats.activeJobs} color="#8B5CF6" delay={200} />
        <StatCard icon="users" label="Talent Pool" value={stats.newCandidates} color="#3B82F6" delay={400} />
        <StatCard icon="calendar" label="Interviews" value={stats.interviewsScheduled} color="#10B981" delay={600} />
        <StatCard icon="clock-o" label="Avg Cycle" value={stats.timeToHire} color="#F59E0B" delay={800} />
      </View>

      {/* Hiring Velocity Trend */}
      <Animated.View entering={FadeInUp.delay(900)} className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 mb-10">
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-white font-bold text-lg">Hiring Velocity</Text>
                <Text className="text-slate-500 text-xs">Applications & Matching efficiency</Text>
            </View>
            <View className="flex-row items-center bg-indigo-500/10 px-3 py-1 rounded-full">
                <FontAwesome name="bolt" size={10} color="#8B5CF6" />
                <Text className="text-indigo-400 text-[10px] font-bold ml-1.5">OPTIMIZED</Text>
            </View>
        </View>

        <View className="h-40 flex-row items-end justify-between px-2">
            {history.map((val, i) => (
                <View key={i} className="items-center">
                    <AnimatedBar height={val} delay={i * 100} color="#8B5CF6" />
                    <Text className="text-[8px] text-slate-600 mt-2 font-bold">{i + 1}</Text>
                </View>
            ))}
        </View>
      </Animated.View>

      {/* AI Admin Modules */}
      <View className="mb-10">
        <Animated.Text entering={FadeInDown.delay(1000)} className="text-xl font-bold text-white mb-6 ml-1">Admin Intelligence</Animated.Text>
        <View className="space-y-4">
            <AdminModuleButton 
                title="AI JD Forge" 
                subtitle="Generate elite tech job descriptions" 
                icon="magic" 
                color="#8B5CF6" 
                onPress={() => router.push('/(recruiter)/jd-forge')}
                delay={1100}
            />
            <AdminModuleButton 
                title="Talent Deep-Audit" 
                subtitle="Brutal honest AI candidate roasting" 
                icon="search-plus" 
                color="#3B82F6" 
                onPress={() => router.push('/(recruiter)/candidates')}
                delay={1200}
            />
            <AdminModuleButton 
                title="System Monitor" 
                subtitle="Analyze hiring pipeline health" 
                icon="gears" 
                color="#64748B" 
                onPress={() => Alert.alert('Coming Soon', 'Detailed pipeline analytics are under development.')}
                delay={1300}
            />
        </View>
      </View>

      {/* Recent Intelligence Feed */}
      <View className="mb-10">
        <View className="flex-row justify-between items-center mb-6">
            <Animated.Text entering={FadeInDown.delay(1400)} className="text-xl font-bold text-white ml-1">Intelligence Feed</Animated.Text>
            <TouchableOpacity onPress={() => router.push('/(recruiter)/candidates')}>
                <Text className="text-indigo-400 text-xs font-bold font-mono">VIEW ALL</Text>
            </TouchableOpacity>
        </View>
        <Animated.View entering={FadeInDown.delay(1500)} className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden p-2">
          {activity.length > 0 ? activity.map((item, index) => (
            <TouchableOpacity 
                key={item.id} 
                activeOpacity={0.8}
                onPress={() => router.push(`/(recruiter)/candidate-audit?userId=${item.userId}&jobId=${item.jobId}`)}
                className={`p-5 flex-row items-center justify-between rounded-3xl ${index % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-indigo-500/10 rounded-2xl items-center justify-center">
                  <Text className="text-indigo-400 font-black text-lg">{item.title[0]}</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base truncate" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-0.5">{item.subtitle}</Text>
                </View>
              </View>
              <View className="bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{item.status}</Text>
              </View>
            </TouchableOpacity>
          )) : (
            <View className="p-10 items-center">
                <Text className="text-slate-500 italic">No historical traces detected.</Text>
            </View>
          )}
        </Animated.View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}

function AdminModuleButton({ title, subtitle, icon, color, onPress, delay }: any) {
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
            <TouchableOpacity 
                onPress={onPress}
                activeOpacity={0.8}
                className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                        <FontAwesome name={icon} size={20} color={color} />
                    </View>
                    <View>
                        <Text className="text-white font-bold text-base">{title}</Text>
                        <Text className="text-slate-500 text-[10px] mt-0.5 uppercase font-medium tracking-tight">{subtitle}</Text>
                    </View>
                </View>
                <FontAwesome name="chevron-right" size={14} color="#334155" />
            </TouchableOpacity>
        </Animated.View>
    );
}

function AnimatedBar({ height, delay, color }: { height: number; delay: number; color: string }) {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: withDelay(delay, withTiming((height / 100) * 140, { duration: 1000 })),
            backgroundColor: color
        };
    });

    return (
        <View className="w-8 bg-slate-800 rounded-t-lg overflow-hidden justify-end">
             <Animated.View 
                style={[animatedStyle]} 
                className="w-full rounded-t-lg opacity-80"
            />
        </View>
    );
}

function StatCard({ icon, label, value, color, delay }: any) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(600)} className="w-[48%]">
      <View className="bg-slate-900 p-5 rounded-[28px] border border-slate-800 items-start">
        <View className="w-10 h-10 rounded-xl items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
            <FontAwesome name={icon} size={18} color={color} />
        </View>
        <Text className="text-3xl font-bold text-white mb-0.5">{value}</Text>
        <Text className="text-[10px] text-slate-500 uppercase font-black tracking-[0.1em]">{label}</Text>
      </View>
    </Animated.View>
  );
}

