'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Vapi from '@vapi-ai/web';
import styles from './session.module.css';

export default function InterviewSession() {
  const [status, setStatus] = useState('initializing');
  const [transcript, setTranscript] = useState([]);
  const vapiRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const sessionId = searchParams.get('id');
  const interviewType = searchParams.get('type') || 'Behavioral';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !sessionId) {
      router.push('/dashboard');
      return;
    }

    const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'your_vapi_public_key';
    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setStatus('connected');
    });

    vapi.on('call-end', () => {
      setStatus('ended');
      finishSession();
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript(prev => [...prev, { role: message.role, text: message.transcript }]);
      }
    });

    vapi.on('error', (e) => {
      console.error('Vapi Error:', e);
      setStatus('error');
    });

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [router, sessionId]);

  const startCall = () => {
    if (!vapiRef.current) return;
    
    setStatus('connecting');
    const user = JSON.parse(localStorage.getItem('user'));

    const systemPrompt = `
      You are an expert ${interviewType} interviewer for the position of ${user.role}.
      The candidate's name is ${user.name} and they have ${user.experience_level} experience.
      
      CRITICAL INSTRUCTIONS:
      1. Start the interview by introducing yourself briefly and stating what we will cover today.
      2. Ask ONE question at a time. Never list multiple questions.
      3. Wait for the candidate to respond completely.
      4. Listen to the candidate's answer carefully. If it's vague, ask a specific follow-up question based on exactly what they just said. Do not just move to a new topic immediately.
      5. Push back if they gloss over details. Acknowledge strong points.
      6. Keep the conversation dynamic and natural, like a real human interviewer.
      7. Once you have asked enough questions (around 5-6 substantial interactions), conclude the interview politely.
    `;

    vapiRef.current.start({
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }]
      },
      voice: {
        provider: '11labs',
        voiceId: 'bIHbv24MWmeRgasZH58o' // Standard professional voice
      }
    });
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const finishSession = async () => {
    try {
      setStatus('generating_report');
      const token = localStorage.getItem('token');
      
      // format transcript for backend
      const formattedTranscript = transcriptRef.current.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`).join('\n');
      
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transcript: formattedTranscript || 'No transcript available.' })
      });
      
      if (res.ok) {
        router.push(`/interview/report/${sessionId}`);
      } else {
        alert('Failed to generate report');
        setStatus('error');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  // Keep a ref to transcript for the finishSession closure
  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  return (
    <div className={styles.container}>
      <div className={styles.activeArea}>
        {status === 'initializing' && (
          <div className={styles.prompt}>
            <h2>Ready for your {interviewType} interview?</h2>
            <p>Ensure your microphone is connected and quiet.</p>
            <button className="btn-primary" onClick={startCall}>Start Session</button>
          </div>
        )}
        
        {status === 'connecting' && (
          <div className={styles.pulseContainer}>
            <div className={styles.pulse}></div>
            <p>Connecting to AI Interviewer...</p>
          </div>
        )}
        
        {status === 'connected' && (
          <div className={styles.activeSession}>
            <div className={styles.waveContainer}>
              <div className={styles.wave}></div>
              <div className={styles.wave}></div>
              <div className={styles.wave}></div>
            </div>
            <h2>Interview in Progress</h2>
            <p>Speak clearly into your microphone.</p>
            <button className={styles.endBtn} onClick={endCall}>End Interview Early</button>
          </div>
        )}
        
        {status === 'generating_report' && (
          <div className={styles.prompt}>
            <h2>Interview Complete</h2>
            <p>Generating your detailed feedback report...</p>
            <div className={styles.spinner}></div>
          </div>
        )}
        
        {status === 'error' && (
          <div className={styles.prompt}>
            <h2>Something went wrong.</h2>
            <button className="btn-primary" onClick={() => router.push('/dashboard')}>Return to Dashboard</button>
          </div>
        )}
      </div>

      <div className={styles.transcriptArea}>
        <h3>Live Transcript</h3>
        <div className={styles.transcriptBox}>
          {transcript.map((msg, idx) => (
            <div key={idx} className={msg.role === 'user' ? styles.msgUser : styles.msgAi}>
              <strong>{msg.role === 'user' ? 'You' : 'Interviewer'}: </strong>
              {msg.text}
            </div>
          ))}
          {transcript.length === 0 && <p className={styles.emptyTranscript}>Conversation will appear here...</p>}
        </div>
      </div>
    </div>
  );
}
