import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LiveService } from '../../lib/services';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostJobScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handlePost = async () => {
    if (!title || !location || !description) {
      Alert.alert('Missing Info', 'Please fill all fields to fuel the AI matching engine.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      await LiveService.postJob(user.id, {
        title,
        type,
        location,
        description
      });

      Alert.alert('Success', 'Mission Control: Job is Live!');
      router.back();
    } catch (error: any) {
      Alert.alert('Deployment Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(600)} className="mb-10">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <FontAwesome name="arrow-left" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-white tracking-tight italic">Initiate Posting</Text>
          <Text className="text-slate-400 mt-1">Define the new frontier for your team.</Text>
        </Animated.View>

        <View className="space-y-6">
          <InputGroup label="Mission Title" value={title} onChange={setTitle} placeholder="e.g. Lead Cyber Engineer" />
          
          <View className="space-y-2">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Engagement Type</Text>
            <View className="flex-row gap-2">
               {['Full-time', 'Contract', 'Part-time'].map(t => (
                 <TouchableOpacity 
                  key={t}
                  onPress={() => setType(t)}
                  className={`px-4 py-2 rounded-xl border ${type === t ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-900 border-slate-800'}`}
                 >
                   <Text className={`text-xs font-bold ${type === t ? 'text-white' : 'text-slate-500'}`}>{t}</Text>
                 </TouchableOpacity>
               ))}
            </View>
          </View>

          <InputGroup label="Base of Operations" value={location} onChange={setLocation} placeholder="e.g. Remote / New York" />

          <View className="space-y-2">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Scope of Work (JD)</Text>
            <TextInput 
              multiline
              numberOfLines={8}
              value={description}
              onChangeText={setDescription}
              placeholder="Inject full job description here..."
              placeholderTextColor="#475569"
              textAlignVertical="top"
              className="bg-slate-900/80 border border-slate-800 text-white rounded-[32px] p-6 text-sm font-mono leading-5 h-64"
            />
          </View>

          <TouchableOpacity 
            onPress={handlePost}
            disabled={loading}
            activeOpacity={0.8}
            className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${loading ? 'bg-slate-800' : 'bg-indigo-600'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome name="bolt" size={20} color="#FBBF24" className="mr-3" />
                <Text className="text-white font-bold text-lg ml-2">Broadcast Position</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  return (
    <Animated.View layout={Layout.springify()} className="space-y-2">
      <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</Text>
      <TextInput 
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        className="bg-slate-900/80 border border-slate-800 text-white h-14 rounded-2xl px-5 text-base"
      />
    </Animated.View>
  );
}
