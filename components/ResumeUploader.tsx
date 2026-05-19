import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface ResumeUploaderProps {
  onUploadComplete: (resumeId: string) => void;
}

export default function ResumeUploader({ onUploadComplete }: ResumeUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Lazy-create user profile if it doesn't exist to prevent FK errors
      await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          email: user.email || '', 
          full_name: 'HireSight User', 
          role: 'job_seeker' 
        }, { onConflict: 'id' });

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          name: 'Text Resume',
          raw_text: pastedText,
          is_default: true,
        })
        .select()
        .single();

      if (error) throw error;

      onUploadComplete(data.id);
      Alert.alert('Success', 'Resume stored in your vault!');
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-6 shadow-2xl">
      <View className="mb-6 flex-row items-center">
        <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center mr-4">
          <FontAwesome name="file-text-o" size={18} color="#3B82F6" />
        </View>
        <View>
          <Text className="text-white font-bold">Resume Text</Text>
          <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-black">AI Deep Scan Input</Text>
        </View>
      </View>

      <View className="space-y-4">
        <TextInput 
          multiline
          placeholder="Paste your full resume text here..."
          placeholderTextColor="#475569"
          value={pastedText}
          onChangeText={setPastedText}
          className="h-64 bg-black/20 border border-slate-800 rounded-3xl p-5 text-slate-300 font-mono text-xs leading-5"
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          onPress={handleTextSubmit}
          disabled={loading || !pastedText.trim()}
          activeOpacity={0.8}
          className={`h-16 rounded-[24px] items-center justify-center shadow-xl ${loading || !pastedText.trim() ? 'bg-slate-800' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center">
              <FontAwesome name="check-circle" size={18} color="white" className="mr-3" />
              <Text className="text-white font-bold text-lg ml-2">Save to Resume Vault</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center my-4">
          <View className="h-[1px] flex-1 bg-slate-800" />
          <Text className="text-[10px] font-black text-slate-500 mx-4 uppercase tracking-widest">or</Text>
          <View className="h-[1px] flex-1 bg-slate-800" />
        </View>

        <TouchableOpacity 
          onPress={() => Alert.alert('Coming Soon', 'PDF/DOCX upload with AI parsing is currently being calibrated.')}
          className="h-16 rounded-[24px] border border-slate-800 items-center justify-center bg-slate-900/30"
        >
          <View className="flex-row items-center">
            <FontAwesome name="file-pdf-o" size={16} color="#64748B" />
            <Text className="text-slate-400 font-bold ml-3 text-sm">Upload PDF / DOCX (Provision)</Text>
          </View>
        </TouchableOpacity>
        
        <Text className="text-center text-slate-500 text-[10px] mt-4 italic">
          Tip: Ensure you include all sections including skills and experience for the best match score.
        </Text>
      </View>
    </View>
  );
}

