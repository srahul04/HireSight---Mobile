import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null);
  const [step, setStep] = useState(1);
  
  // Form States
  const [name, setName] = useState('');
  const [roleInfo, setRoleInfo] = useState('');
  const [experience, setExperience] = useState('');

  const handleContinue = async () => {
    if (step === 1) {
      if (role) setStep(2);
    } else if (step === 2) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Upsert user profile to ensure record exists
        await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            full_name: name,
            role: role === 'candidate' ? 'job_seeker' : 'recruiter',
            bio: `Target: ${roleInfo}, Experience: ${experience}`,
            updated_at: new Date().toISOString()
          });

        if (role === 'candidate') {
          router.replace('/(candidate)/dashboard');
        } else {
          router.replace('/(recruiter)/dashboard');
        }
      } else {
        // Not logged in: Carry data to signup (simplified: using router params or state)
        // For now, redirect to signup and assume they'll fill it in, 
        // or we could use a global state/context if available.
        router.push({
          pathname: '/signup',
          params: { role, name, roleInfo, experience }
        } as any);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        
        {step === 1 ? (
          <Animated.View entering={FadeIn.duration(600)} className="space-y-8">
            <View>
              <Animated.Text entering={FadeInUp.delay(200).duration(800)} className="text-5xl font-extrabold text-blue-500 mb-2 italic tracking-tighter">
                HireSight
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(400).duration(800)} className="text-slate-400 text-lg leading-6">
                AI Intentelligence for the modern hiring journey.
              </Animated.Text>
            </View>

            <View className="space-y-4 mt-8">
              <RoleCard 
                selected={role === 'candidate'} 
                onPress={() => setRole('candidate')}
                icon="user"
                title="I am a Student / Candidate"
                description="Optimize your profile and crush your next interview."
                color="#3B82F6"
                delay={600}
              />

              <RoleCard 
                selected={role === 'recruiter'} 
                onPress={() => setRole('recruiter')}
                icon="building"
                title="I am a Recruiter"
                description="Source top talent with semantic AI matching."
                color="#8B5CF6"
                delay={800}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={SlideInRight} className="space-y-8">
            <View>
              <Text className="text-3xl font-bold text-white mb-2">Almost there.</Text>
              <Text className="text-slate-400">Personalize your {role} profile.</Text>
            </View>

            <View className="space-y-6 mt-4">
              <InputField label="Full Name" value={name} onChange={setName} placeholder="Jane Doe" />
              <InputField 
                label={role === 'candidate' ? 'Target Role' : 'Company Name'} 
                value={roleInfo} 
                onChange={setRoleInfo} 
                placeholder={role === 'candidate' ? 'e.g. React Developer' : 'e.g. Google'} 
              />
              <InputField 
                label={role === 'candidate' ? 'Years of Experience' : 'Openings'} 
                value={experience} 
                onChange={setExperience} 
                placeholder="e.g. 2"
                keyboardType="numeric"
              />
            </View>
          </Animated.View>
        )}

        <View className="mt-12 flex-row justify-between items-center">
          {step === 2 && (
            <TouchableOpacity onPress={() => setStep(1)} className="p-4">
              <Text className="text-slate-500 font-bold">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            disabled={step === 1 && !role}
            onPress={handleContinue}
            activeOpacity={0.8}
            className={`h-16 px-10 rounded-2xl flex-row items-center justify-center ml-auto shadow-2xl ${step === 1 && !role ? 'bg-slate-800' : (role === 'recruiter' && step === 1 ? 'bg-secondary' : 'bg-primary')}`}
          >
            <Text className="text-white font-bold text-lg">{step === 1 ? 'Continue' : 'Start Session'}</Text>
            <FontAwesome name="arrow-right" size={16} color="white" className="ml-3" />
          </TouchableOpacity>
        </View>

        {step === 1 && (
          <View className="mt-8 items-center">
            <Text className="text-slate-500 mb-2">Already have an account?</Text>
            <Link href="/login" asChild>
                <TouchableOpacity>
                    <Text className="text-blue-500 font-bold text-lg">Sign In here</Text>
                </TouchableOpacity>
            </Link>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function RoleCard({ selected, onPress, icon, title, description, color, delay }: any) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.9}
        className={`p-6 rounded-[32px] border-2 transition-all ${selected ? `border-[${color}] bg-white/[0.03]` : 'border-slate-800 bg-slate-900/50'}`}
        style={selected ? { borderColor: color, backgroundColor: 'rgba(255,255,255,0.02)' } : {}}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${color}20` }}>
            <FontAwesome name={icon} size={24} color={color} />
          </View>
          <Text className="text-xl font-bold text-white">{title}</Text>
        </View>
        <Text className="text-sm text-slate-500 leading-5">{description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function InputField({ label, value, onChange, placeholder, keyboardType }: any) {
  return (
    <Animated.View layout={Layout.springify()} className="space-y-2">
      <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</Text>
      <TextInput 
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        keyboardType={keyboardType}
        className="bg-slate-900/80 border border-slate-800 text-white h-14 rounded-2xl px-5 text-base font-medium focus:border-blue-500/50"
      />
    </Animated.View>
  );
}
