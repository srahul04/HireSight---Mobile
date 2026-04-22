import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { LiveService } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeInRight, FadeInUp, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CandidateDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [liveStats, liveActivity] = await Promise.all([
          LiveService.getCandidateStats(user.id),
          LiveService.getRecentApplications(user.id)
        ]);
        
        setStats(liveStats);
        setActivity(liveActivity.map((app: any) => ({
          id: app.id,
          title: app.company_name,
          subtitle: app.role,
          time: new Date(app.created_at).toLocaleDateString(),
          status: app.status,
          score: app.ats_score || 0,
          feedback: app.interview_tips || 'System analysis pending.'
        })));

        // Get history for chart (last 7 applications)
        const historyScores = liveActivity.slice(0, 7).reverse().map(a => a.ats_score || 0);
        // Pad if less than 7
        while (historyScores.length < 7) historyScores.unshift(0);
        setHistory(historyScores);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#3B82F6" /></View>;
  if (!stats) return <View className="flex-1 bg-background items-center justify-center"><Text className="text-white">Please login to see your dashboard.</Text></View>;

  return (
    <ScrollView className="flex-1 bg-background p-6" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
        <Text className="text-4xl font-bold text-white italic tracking-tighter">Command Center</Text>
        <Text className="text-slate-400 mt-1 text-base">You're {5 - (stats.applications % 5)} steps away from your next milestone.</Text>
      </Animated.View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        <StatCard icon="briefcase" label="Apps" value={stats.applications} color="#3B82F6" delay={200} />
        <StatCard icon="bullseye" label="ATS Score" value={stats.atsScore} color="#10B981" delay={400} />
        <StatCard icon="calendar" label="Status" value={stats.interviewRate} color="#8B5CF6" delay={600} />
        <StatCard icon="file-text" label="Resumes" value={stats.resumes} color="#F59E0B" delay={800} />
      </View>

      {/* Futuristic Score Trend Chart */}
      <Animated.View entering={FadeInUp.delay(900)} className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 mb-8">
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-white font-bold text-lg">ATS Score Trend</Text>
                <Text className="text-slate-500 text-xs">Performance across recent deep scans</Text>
            </View>
            <View className="flex-row items-center bg-blue-500/10 px-3 py-1 rounded-full">
                <FontAwesome name="arrow-up" size={10} color="#3B82F6" />
                <Text className="text-blue-500 text-[10px] font-bold ml-1.5">+12.4%</Text>
            </View>
        </View>

        <View className="h-40 flex-row items-end justify-between px-2">
            {history.map((score, i) => (
                <View key={i} className="items-center">
                    <AnimatedBar height={score} delay={i * 100} />
                    <Text className="text-[8px] text-slate-600 mt-2 font-bold">{i + 1}</Text>
                </View>
            ))}
        </View>
      </Animated.View>

      {/* Action Banners Grid */}
      <View className="flex-row gap-4 mb-8">
        <TouchableOpacity 
          onPress={() => router.push('/(candidate)/browse-jobs')}
          activeOpacity={0.9}
          className="flex-1 p-5 bg-slate-900 border border-blue-500/20 rounded-[32px] items-center justify-center"
        >
          <View className="w-12 h-12 bg-blue-500/10 rounded-2xl items-center justify-center mb-3">
            <FontAwesome name="search" size={20} color="#3B82F6" />
          </View>
          <Text className="text-white font-bold text-sm">Browse Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(candidate)/analyze')}
          activeOpacity={0.9}
          className="flex-1 p-5 bg-slate-900 border border-emerald-500/20 rounded-[32px] items-center justify-center"
        >
          <View className="w-12 h-12 bg-emerald-500/10 rounded-2xl items-center justify-center mb-3">
            <FontAwesome name="bolt" size={20} color="#10B981" />
          </View>
          <Text className="text-white font-bold text-sm">Deep Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Mission Intelligence Modules */}
      <View className="mb-10">
        <Animated.Text entering={FadeInDown.delay(1000)} className="text-xl font-bold text-white mb-6 ml-1">Mission Intelligence</Animated.Text>
        
        <View className="space-y-4">
            <ModuleButton 
                title="LaTeX Resume Hub" 
                subtitle="Tailor elite tech resumes for JD" 
                icon="code" 
                color="#8B5CF6" 
                onPress={() => router.push('/(candidate)/latex-builder')}
                delay={1100}
            />
            <ModuleButton 
                title="AI Mock Interview" 
                subtitle="5-minute high-stakes mission" 
                icon="microphone" 
                color="#F59E0B" 
                onPress={() => router.push('/(candidate)/mock-interview')}
                delay={1200}
            />
            <ModuleButton 
                title="LinkedIn Forge" 
                subtitle="Optimize profile with surgical AI" 
                icon="linkedin" 
                color="#3B82F6" 
                onPress={() => router.push('/(candidate)/linkedin')}
                delay={1300}
            />
        </View>
      </View>

      {/* Recent Intelligence */}
      <View className="mb-10">
        <Animated.Text entering={FadeInDown.delay(1200)} className="text-xl font-bold text-white mb-5 ml-1">Recent Intelligence</Animated.Text>
        <Animated.View entering={FadeInDown.delay(1300)} className="bg-slate-900/50 rounded-[32px] border border-slate-800 overflow-hidden">
          {activity.length > 0 ? activity.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.7}
              onPress={() => Alert.alert(`Intelligence: ${item.title}`, item.feedback)}
              className={`p-5 flex-row items-center justify-between ${index !== activity.length - 1 ? 'border-b border-slate-800/50' : ''}`}
            >
              <View className="flex-row items-center gap-4 flex-1 mr-4">
                <View className="w-2 h-2 rounded-full bg-blue-500" />
                <View className="flex-1">
                  <Text className="text-slate-200 font-bold text-base" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5" numberOfLines={1}>{item.subtitle} • {item.time}</Text>
                </View>
              </View>
              <View className="items-end gap-1">
                <View className={`px-2 py-0.5 rounded-full ${item.score > 85 ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                    <Text className={`font-bold text-[10px] ${item.score > 85 ? 'text-green-500' : 'text-blue-500'}`}>{item.score}%</Text>
                </View>
                <Text className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{item.status}</Text>
              </View>
            </TouchableOpacity>
          )) : (
            <View className="p-10 items-center">
                <Text className="text-slate-500 italic">Complete a scan to see activity.</Text>
            </View>
          )}
        </Animated.View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}

function AnimatedBar({ height, delay }: { height: number; delay: number }) {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: withDelay(delay, withTiming((height / 100) * 140, { duration: 1000 })),
        };
    });

    return (
        <View className="w-8 bg-slate-800 rounded-t-lg overflow-hidden justify-end">
             <Animated.View 
                style={[animatedStyle, { backgroundColor: height > 85 ? '#10B981' : '#3B82F6' }]} 
                className="w-full rounded-t-lg"
            />
        </View>
    );
}

function ModuleButton({ title, subtitle, icon, color, onPress, delay }: any) {
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

