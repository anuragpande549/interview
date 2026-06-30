'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import styles from './report.module.css';
import ReactMarkdown from 'react-markdown';

export default function ReportPage({ params }) {
  const { id } = use(params);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/sessions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading report...</div>;
  if (!session) return <div className={styles.loading}>Report not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>{session.type} Interview Report</h1>
          <p>Completed on {new Date(session.createdAt).toLocaleDateString()}</p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </button>
      </header>

      <div className={styles.content}>
        <section className={styles.feedbackSection}>
          <h2>AI Feedback & Analysis</h2>
          <div className={styles.markdownBox}>
            {session.feedback_report ? (
              <ReactMarkdown>{session.feedback_report}</ReactMarkdown>
            ) : (
              <p>No feedback report was generated.</p>
            )}
          </div>
        </section>

        <section className={styles.transcriptSection}>
          <h2>Full Transcript</h2>
          <div className={styles.transcriptBox}>
            {session.transcript ? (
              session.transcript.split('\n').map((line, i) => (
                <div key={i} className={styles.transcriptLine}>{line}</div>
              ))
            ) : (
              <p>No transcript available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
