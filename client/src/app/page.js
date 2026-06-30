'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, role, experience_level: experience };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Mock Interview AI</h1>
        <p className={styles.subtitle}>
          Practice real, dynamic voice interviews with an AI that listens, pushes back, and adapts.
        </p>
      </div>

      <div className={styles.authCard}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div>
                <label className="label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="label">Target Job Role</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  required 
                />
              </div>
              <div>
                <label className="label">Experience Level</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. Mid-Level, 3 years"
                  required 
                />
              </div>
            </>
          )}

          <div>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </main>
  );
}
