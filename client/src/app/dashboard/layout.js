'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>Mock Interview AI</div>
        <div className={styles.userMenu}>
          <span className={styles.userName}>{user.name}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
