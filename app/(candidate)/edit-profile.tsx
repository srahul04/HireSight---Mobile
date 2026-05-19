import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (data) {
          setFullName(data.full_name || '');
          setBio(data.bio || '');
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setLinkedinUrl(data.linkedin_url || '');
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('users').update({
        full_name: fullName,
        bio,
        phone,
        location,
        linkedin_url: linkedinUrl,
      }).eq('id', user.id);

      if (error) throw error;
      Alert.alert('Profile Updated', 'Your credentials have been synced.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  if (loading) return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#3B82F6" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-4">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <FontAwesome name="arrow-left" size={18} color="#3B82F6" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-white tracking-tight italic">Profile Tuning</Text>
          <Text className="text-slate-400 mt-1">Edit your identity and credentials.</Text>
        </Animated.View>

        <View className="space-y-6">
          <ProfileField label="Full Name" value={fullName} onChange={setFullName} placeholder="Jane Doe" icon="user" />
          <ProfileField label="Bio / Target Role" value={bio} onChange={setBio} placeholder="e.g. Full-Stack Developer" icon="info-circle" multiline />
          <ProfileField label="Phone" value={phone} onChange={setPhone} placeholder="+1 234 567 890" icon="phone" keyboardType="phone-pad" />
          <ProfileField label="Location" value={location} onChange={setLocation} placeholder="e.g. New York, NY" icon="map-marker" />
          <ProfileField label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." icon="linkedin" />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`mt-10 h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${saving ? 'bg-slate-800' : 'bg-blue-600'}`}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <FontAwesome name="check" size={20} color="#fff" />
              <Text className="text-white font-bold text-lg ml-3">Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileField({ label, value, onChange, placeholder, icon, multiline, keyboardType }: any) {
  return (
    <View className="space-y-2">
      <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</Text>
      <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl px-5">
        <FontAwesome name={icon} size={16} color="#64748B" />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          multiline={multiline}
          keyboardType={keyboardType}
          className={`flex-1 text-white ml-4 ${multiline ? 'h-24 py-4' : 'h-14'}`}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}
