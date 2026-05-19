import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// TODO: Phase 2 — Full pipeline analytics implementation
// This screen will show:
// 1. Applications funnel (Applied → Screened → Interview → Hired)
// 2. Time-to-hire trends (animated line chart)
// 3. Top-performing JDs by applicant count
// 4. Diversity & source breakdown

export default function PipelineScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadPipeline() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch basic pipeline data from existing tables
        const { data: jobs } = await supabase
          .from('job_postings')
          .select('id, title')
          .eq('recruiter_id', user.id);

        const jobIds = jobs?.map(j => j.id) || [];
        let totalApplicants = 0;
        let stageBreakdown = { new: 0, screening: 0, interview: 0, offer: 0 };

        if (jobIds.length > 0) {
          const { data: apps } = await supabase
            .from('applications')
            .select('status')
            .in('job_id', jobIds);

          totalApplicants = apps?.length || 0;
          apps?.forEach((a: any) => {
            const stage = a.status?.toLowerCase() || 'new';
            if (stage in stageBreakdown) {
              stageBreakdown[stage as keyof typeof stageBreakdown]++;
            } else {
              stageBreakdown.new++;
            }
          });
        }

        setStats({
          totalJobs: jobs?.length || 0,
          totalApplicants,
          stages: stageBreakdown,
          jobs: jobs || []
        });
      }
      setLoading(false);
    }
    loadPipeline();
  }, []);

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#8B5CF6" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <FontAwesome name="arrow-left" size={18} color="#8B5CF6" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-white tracking-tight italic">System Monitor</Text>
          <Text className="text-slate-400 mt-1">Pipeline health & hiring analytics.</Text>
        </Animated.View>

        {/* Pipeline Funnel — Provision for animated funnel chart */}
        <Animated.View entering={FadeInUp.delay(200)} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 mb-6">
          <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-6">Hiring Funnel</Text>

          <FunnelStage label="New Applicants" count={stats?.stages?.new || 0} color="#3B82F6" width="100%" />
          <FunnelStage label="Screening" count={stats?.stages?.screening || 0} color="#8B5CF6" width="75%" />
          <FunnelStage label="Interview" count={stats?.stages?.interview || 0} color="#F59E0B" width="50%" />
          <FunnelStage label="Offer" count={stats?.stages?.offer || 0} color="#10B981" width="30%" />
        </Animated.View>

        {/* Summary Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-slate-900 p-5 rounded-[28px] border border-slate-800">
            <Text className="text-3xl font-bold text-white">{stats?.totalJobs || 0}</Text>
            <Text className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Active Roles</Text>
          </View>
          <View className="flex-1 bg-slate-900 p-5 rounded-[28px] border border-slate-800">
            <Text className="text-3xl font-bold text-white">{stats?.totalApplicants || 0}</Text>
            <Text className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Total Pipeline</Text>
          </View>
        </View>

        {/* TODO: Phase 2 — Time-to-hire line chart using Reanimated */}
        <Animated.View entering={FadeInUp.delay(400)} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 mb-6">
          <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Time-to-Hire Trend</Text>
          <View className="h-40 items-center justify-center">
            <FontAwesome name="line-chart" size={40} color="#334155" />
            <Text className="text-slate-500 mt-4 text-xs italic">Detailed analytics coming in next update.</Text>
          </View>
        </Animated.View>

        {/* TODO: Phase 2 — Source breakdown & diversity metrics */}
        <Animated.View entering={FadeInUp.delay(600)} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 mb-10">
          <Text className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Source Intelligence</Text>
          <View className="h-32 items-center justify-center">
            <FontAwesome name="pie-chart" size={40} color="#334155" />
            <Text className="text-slate-500 mt-4 text-xs italic">Applicant source tracking coming soon.</Text>
          </View>
        </Animated.View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function FunnelStage({ label, count, color, width }: { label: string; count: number; color: string; width: string }) {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-slate-400 text-xs font-bold">{label}</Text>
        <Text className="text-white font-black">{count}</Text>
      </View>
      <View className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <View
          style={{ width: count > 0 ? width : '0%', backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}
