import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LiveService } from '../../lib/services';
import { groq } from '../../lib/ai';
import { useAudioRecorder, AudioModule, RecordingOptionsPresets } from 'expo-audio';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MockInterviewScreen() {
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const recorder = useAudioRecorder(RecordingOptionsPresets.HIGH_QUALITY);
  
  const timerRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  const startSession = async () => {
    const { status } = await AudioModule.requestRecordingPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Microphone access is required for mock interviews.');
      return;
    }

    setMessages([{ role: 'assistant', content: "Hello! I'm your Lead Interviewer today. We have 5 minutes for this screening. Are you ready to begin? Tell me a bit about yourself." }]);
    setSessionActive(true);
    setTimeLeft(300);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
            endSession();
            return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    const report = await LiveService.getInterviewFeedback(messages);
    setFeedback(report);

    // Persist session to Supabase
    const { data: { user } } = await (await import('../../lib/supabase')).supabase.auth.getUser();
    if (user && report) {
      await LiveService.saveInterviewSession(user.id, messages, report);
    }

    setSessionActive(false);
    setLoading(false);
  };

  const startRecording = async () => {
    try {
      await recorder.record();
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        setLoading(true);
        const text = await LiveService.transcribeAudio(uri);
        if (text) {
            handleNextStep(text);
        } else {
            setLoading(false);
        }
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleNextStep = async (userText: string) => {
    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a professional Hiring Manager. Keep your responses brief and ask one relevant follow-up question. If time is low, ask one final impactful question.' },
                ...updatedMessages
            ],
            model: 'llama-3.3-70b-versatile',
        });
        const aiText = completion.choices[0].message.content || "I see. Let's move on.";
        setMessages([...updatedMessages, { role: 'assistant', content: aiText }]);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
     scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (feedback) {
    return (
        <SafeAreaView className="flex-1 bg-background p-6">
            <Animated.View entering={FadeInUp.duration(600)} className="mb-10 text-center items-center">
                <View className="w-20 h-20 bg-blue-500/10 rounded-full items-center justify-center mb-6">
                    <FontAwesome name="check-circle" size={40} color="#3B82F6" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">Session Summary</Text>
                <Text className={`text-xl font-black uppercase tracking-widest ${feedback.decision === 'Hired' ? 'text-green-500' : 'text-blue-500'}`}>
                    Decision: {feedback.decision}
                </Text>
            </Animated.View>

            <ScrollView className="space-y-6" showsVerticalScrollIndicator={false}>
                <View className="bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                    <Text className="text-blue-400 font-bold mb-3 uppercase tracking-widest text-xs">AI Evaluation</Text>
                    <Text className="text-slate-300 text-base leading-6">{feedback.summary}</Text>
                    <View className="h-px bg-slate-800 my-5" />
                    <View className="flex-row items-center justify-between">
                        <Text className="text-slate-500 font-bold">Interview Score</Text>
                        <Text className="text-white font-black text-2xl">{feedback.score}%</Text>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1 bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                        <Text className="text-green-500 font-bold mb-4 text-xs uppercase tracking-widest">Strengths</Text>
                        {feedback.strengths?.map((s: string, i: number) => (
                            <Text key={i} className="text-slate-400 text-xs mb-2 leading-4">• {s}</Text>
                        ))}
                    </View>
                    <View className="flex-1 bg-slate-900 p-6 rounded-[32px] border border-slate-800">
                        <Text className="text-blue-400 font-bold mb-4 text-xs uppercase tracking-widest">Growth Areas</Text>
                        {feedback.weaknesses?.map((w: string, i: number) => (
                            <Text key={i} className="text-slate-400 text-xs mb-2 leading-4">• {w}</Text>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity 
                onPress={() => setFeedback(null)}
                className="bg-blue-600 h-16 rounded-[24px] items-center justify-center mt-6 shadow-xl"
            >
                <Text className="text-white font-bold text-lg">Retake Mission</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {!sessionActive ? (
        <View className="flex-1 items-center justify-center p-8">
            <Animated.View entering={FadeInDown.duration(800)} className="items-center">
                <View className="w-24 h-24 bg-blue-600/10 rounded-[32px] items-center justify-center mb-8 border border-blue-500/20">
                    <FontAwesome name="microphone" size={40} color="#3B82F6" />
                </View>
                <Text className="text-4xl font-bold text-white mb-3 tracking-tighter italic text-center">Elite Screening</Text>
                <Text className="text-slate-500 text-center text-base mb-12 leading-6">
                    A high-stakes 5-minute technical session with our lead hiring intelligence.
                </Text>
                <TouchableOpacity 
                    onPress={startSession}
                    className="bg-blue-600 h-16 px-12 rounded-[24px] items-center justify-center shadow-2xl shadow-blue-500/40"
                >
                    <Text className="text-white font-bold text-lg">Initiate Mission</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
      ) : (
        <View className="flex-1 p-6">
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => { clearInterval(timerRef.current); setSessionActive(false); }}>
                    <FontAwesome name="close" size={20} color="#64748B" />
                </TouchableOpacity>
                <View className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800 flex-row items-center">
                    <FontAwesome name="clock-o" size={14} color={timeLeft < 60 ? '#EF4444' : '#64748B'} className="mr-2" />
                    <Text className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-slate-400'}`}>{formatTime(timeLeft)}</Text>
                </View>
                <TouchableOpacity onPress={endSession}>
                    <Text className="text-blue-500 font-bold">End</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                ref={scrollRef}
                className="flex-1 mb-6" 
                showsVerticalScrollIndicator={false}
            >
                {messages.map((m, i) => (
                    <Animated.View 
                        key={i} 
                        entering={FadeInUp.delay(100)}
                        className={`mb-6 max-w-[85%] ${m.role === 'assistant' ? 'self-start' : 'self-end'}`}
                    >
                        <View className={`p-5 rounded-[28px] ${m.role === 'assistant' ? 'bg-slate-900 border border-slate-800' : 'bg-blue-600 shadow-lg'}`}>
                            <Text className={`${m.role === 'assistant' ? 'text-slate-300' : 'text-white'} text-base leading-6`}>
                                {m.content}
                            </Text>
                        </View>
                    </Animated.View>
                ))}
                {loading && (
                    <View className="bg-slate-900 border border-slate-800 p-5 rounded-[24px] self-start mb-6">
                        <ActivityIndicator color="#3B82F6" size="small" />
                    </View>
                )}
            </ScrollView>

            <View className="items-center pb-8">
                <TouchableOpacity 
                    onLongPress={startRecording}
                    onPressOut={stopRecording}
                    disabled={loading}
                    className={`w-20 h-20 rounded-full items-center justify-center shadow-2xl ${recorder.isRecording ? 'bg-red-500' : 'bg-blue-600'} ${loading ? 'opacity-50' : ''}`}
                >
                    <FontAwesome name={recorder.isRecording ? 'stop' : 'microphone'} size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-slate-500 mt-4 text-xs font-bold uppercase tracking-widest">
                    {recorder.isRecording ? 'Release to Send' : 'Hold to Speak'}
                </Text>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}
