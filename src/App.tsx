import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

type Page = 'landing' | 'login' | 'register' | 'app';

function App() {
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    // Auto-navigate to app if user is logged in
    if (user && currentPage !== 'app') {
      setCurrentPage('app');
    } else if (!user && currentPage === 'app') {
      setCurrentPage('landing');
    }
  }, [user, currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const handleAuthSubmit = async (email: string, password: string, fullName?: string) => {
    if (currentPage === 'register' && fullName) {
      await signUp(email, password, fullName);
    } else {
      await signIn(email, password);
    }
    // Navigation will happen automatically via useEffect
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('landing');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (currentPage === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'login' || currentPage === 'register') {
    return (
      <AuthPage
        type={currentPage}
        onNavigate={handleNavigate}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  if (currentPage === 'app' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return null;
}

export default App;
