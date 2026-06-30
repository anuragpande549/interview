'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading sessions...</div>;

  return (
    <>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Your Interviews</h1>
        <button className="btn-primary" onClick={() => router.push('/interview/setup')}>
          Start New Interview
        </button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p>You haven't completed any mock interviews yet.</p>
          <p style={{ marginTop: '1rem' }}>Click "Start New Interview" to begin your first session!</p>
        </div>
      ) : (
        <div className={styles.sessionsGrid}>
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className={styles.sessionCard}
              onClick={() => router.push(`/interview/report/${session.id}`)}
            >
              <div className={styles.sessionType}>{session.type} Interview</div>
              <div className={styles.sessionDate}>
                {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}
              </div>
              <div className={styles.sessionStatus}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
