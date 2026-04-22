import { supabase } from './supabase';
import { groq } from './ai';

export const LiveService = {
  // --- AUTH & USER ---
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return data || null;
  },

  // --- CANDIDATE SERVICES ---
  getCandidateStats: async (userId: string) => {
    // Fetching from 'applications' and 'resumes' table
    const { data: apps } = await supabase
      .from('applications')
      .select('id, ats_score')
      .eq('user_id', userId);
      
    const { data: resumes } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', userId);
      
    const totalApps = apps?.length || 0;
    const avgScore = totalApps > 0 
      ? Math.round(apps!.reduce((acc, curr) => acc + (curr.ats_score || 0), 0) / totalApps) 
      : 0;

    return {
      applications: totalApps,
      atsScore: avgScore,
      interviewRate: totalApps > 0 ? `${Math.round((totalApps / 5) * 10)}%` : '0%', // Mock logic for rate
      resumes: resumes?.length || 0
    };
  },

  getRecentApplications: async (userId: string) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    return data || [];
  },

  // --- RECRUITER SERVICES ---
  getRecruiterStats: async (recruiterId: string) => {
    const { data: jobs } = await supabase
      .from('job_postings')
      .select('id')
      .eq('recruiter_id', recruiterId);
      
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id')
      .eq('recruiter_id', recruiterId);

    return {
      activeJobs: jobs?.length || 0,
      newCandidates: candidates?.length || 0,
      interviewsScheduled: Math.floor((candidates?.length || 0) / 3),
      timeToHire: '14 Days'
    };
  },

  getJobPostings: async (recruiterId: string) => {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });
    
    // For each job, count applicants (simplified for now)
    return data || [];
  },

  postJob: async (recruiterId: string, jobData: any) => {
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        recruiter_id: recruiterId,
        title: jobData.title,
        type: jobData.type,
        location: jobData.location,
        description: jobData.description,
        is_live: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getGlobalCandidates: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*, resumes(*)')
      .eq('role', 'job_seeker');
    
    return data || [];
  },

  getApplicantsForJob: async (jobId: string) => {
    // This assumes an 'applications' table exists with job_id
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('applications')
      .select('*, users(*)')
      .eq('job_id', jobId);
    
    return data || [];
  },

  getAllJobs: async () => {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*, recruiters:recruiter_id(full_name)')
      .eq('is_live', true)
      .order('created_at', { ascending: false });
    
    return data || [];
  },

  // --- AI SERVICES (Groq) ---
  analyzeJD: async (resumeText: string, jdText: string) => {
    const model = 'llama-3.3-70b-versatile';
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an elite Technical Recruiter and ATS Optimization Expert. 
Your goal is to perform a semantic deep scan of a user's resume against a Job Description.

Analyze the following:
1. Official ATS Score (0-100): How well the keywords and skills align.
2. The Verdict: A short, punchy hiring decision.
3. The Summary: A 2-sentence professional analysis.
4. Misconceptions: Identify 3-4 specific areas where the resume might be "misinterpreted" by automated systems (e.g., non-standard section headers, complex tables, missing buzzwords, or skill gaps).

Return EXACTLY this JSON structure:
{
  "score": number,
  "verdict": "string",
  "summary": "string",
  "misconceptions": ["string", "string", ...],
  "feedback": "string (overall actionable advice)"
}`
          },
          {
            role: 'user',
            content: `RESUME CONTENT:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}`
          }
        ],
        model: model,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        score: response.score || 0,
        verdict: response.verdict || 'Analysis Failed',
        summary: response.summary || 'Could not parse response.',
        misconceptions: response.misconceptions || [],
        feedback: response.feedback || 'Try refining your resume with more industry-standard keywords.'
      };
    } catch (error) {
      console.error('Groq Error:', error);
      return { 
        score: 0, 
        verdict: 'Deep Scan Error', 
        summary: 'AI scan failed.', 
        misconceptions: ['Integration error'],
        feedback: 'Check your internet connection and try again.'
      };
    }
  },

  generateTailoredLaTeX: async (resumeText: string, jdText: string) => {
    const model = 'llama-3.3-70b-versatile';
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert LaTeX developer and Career Coach. 
Your task is to rewrite the user's resume in a professional, "Elite Tech" LaTeX format specifically tailored to the provided Job Description.

STYLE GUIDELINES:
1. Use standard LaTeX packages like 'geometry', 'hyperref', 'enumitem', 'titlesec'.
2. The format must be clean, minimal, and optimized for ATS systems (single column, clear section headers).
3. Use a document class like 'article' or a modern resume class if you define it inline.
4. Focus on quantification (metrics, %, $) and keywords from the JD.

Return EXACTLY this JSON structure:
{
  "latex": "the full latex source code as a single string",
  "explanation": "brief overview of what you optimized for this JD"
}`
          },
          {
            role: 'user',
            content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jdText}`
          }
        ],
        model: model,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response;
    } catch (error) {
      console.error('LaTeX Generation Error:', error);
      return { latex: '', explanation: 'Failed to generate tailored resume.' };
    }
  },

  transcribeAudio: async (uri: string) => {
    try {
      // For mobile, we need to create a File-like object or use FormData
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Transcription Error:', error);
      return '';
    }
  },

  getInterviewFeedback: async (history: any[]) => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a Senior Hiring Manager. Analyze the following interview transcript and provide a final "Hiring Decision" and feedback.
            Focus on: Technical Accuracy, Communication Clarity, and Confidence.
            
            Return JSON:
            {
              "decision": "Hired/Waitlist/Rejected",
              "score": number (0-100),
              "strengths": ["string"],
              "weaknesses": ["string"],
              "summary": "string"
            }`
          },
          {
            role: 'user',
            content: `INTERVIEW TRANSCRIPT:\n${JSON.stringify(history)}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      return { decision: 'Rejected', score: 0, summary: 'Feedback analysis failed.' };
    }
  },

  generateEliteJD: async (role: string, level: string, focus: string) => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an elite Tech Hiring Manager and Copywriter. 
Your goal is to generate a high-impact, "Elite Tech" Job Description.
Style: Professional but aggressive, highly attractive to top talent, keyword-optimized for ATS.

Return JSON:
{
  "title": "string (optimized job title)",
  "description": "the full markdown-formatted JD",
  "keywords": ["string", "string", ...]
}`
          },
          {
            role: 'user',
            content: `Role: ${role}, Level: ${level}, Primary Focus: ${focus}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error(error);
      return { title: role, description: 'Failed to generate JD.' };
    }
  },

  roastCandidate: async (resumeText: string, jdText: string) => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a "Brutally Honest" Technical Recruiter. 
Analyze the candidate's resume against the target JD. 
Provide a "Roast" that highlights exactly where they are puffing, what they are missing, and why they might be a high-risk hire.
Provide a "Gaps" list and a "Recommendation".

Return JSON:
{
  "roast": "string",
  "gaps": ["string", "string", ...],
  "recommendation": "string (Proceed/Interview/Reject with reason)"
}`
          },
          {
            role: 'user',
            content: `RESUME:\n${resumeText}\n\nJD:\n${jdText}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      return { roast: 'Analysis error.', gaps: [], recommendation: 'Manual Review Required' };
    }
  }
};
