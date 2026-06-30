'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './setup.module.css';

export default function InterviewSetup() {
  const [selectedType, setSelectedType] = useState('Behavioral');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const interviewTypes = [
    { id: 'Behavioral', title: 'Behavioral', desc: 'Focuses on past experiences, communication, STAR method, and self-awareness.' },
    { id: 'Technical', title: 'Technical', desc: 'Tests depth of knowledge, problem-solving, and coding approach.' },
    { id: 'System Design', title: 'System Design', desc: 'Architecture thinking, tradeoffs, and communicating complex systems.' },
    { id: 'HR / Culture Fit', title: 'HR / Culture Fit', desc: 'Motivation, values, situational judgment, and alignment with company.' }
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: selectedType })
      });

      if (res.ok) {
        const session = await res.json();
        router.push(`/interview/session?id=${session.id}&type=${encodeURIComponent(selectedType)}`);
      } else {
        alert('Failed to start session');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.card}>
        <h1 className={styles.title}>Configure Your Interview</h1>
        <p className={styles.subtitle}>Select the type of interview you want to practice. The AI will adapt its persona and questions accordingly.</p>
        
        <div className={styles.grid}>
          {interviewTypes.map(type => (
            <div 
              key={type.id} 
              className={`${styles.typeCard} ${selectedType === type.id ? styles.selected : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              <h3>{type.title}</h3>
              <p>{type.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className="btn-primary" onClick={handleStart} disabled={loading} style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}>
            {loading ? 'Preparing AI...' : 'Start Voice Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
