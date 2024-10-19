import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Studio from './components/Studio';
import Products from './components/Products';
import Campaigns from './components/Campaigns';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import AuthForms from './components/AuthForms';
import { User, getCurrentUser, logout } from './utils/auth';
import { ProductProvider } from './contexts/ProductContext';
import { supabase } from './lib/supabaseClient';
import { testDatabaseConnection } from './utils/dbTest';

function App() {
  console.log('App component rendering');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App useEffect running');
    const initializeApp = async () => {
      console.log('Initializing app...');
      setIsLoading(true);
      try {
        console.log('Testing database connection...');
        const dbStatus = await testDatabaseConnection();
        console.log('Database connection status:', dbStatus);
        setDbConnectionStatus(dbStatus);

        console.log('Getting current user...');
        const currentUser = await getCurrentUser();
        console.log('Current user:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setError('Failed to initialize the app. Please try again.');
      } finally {
        setIsLoading(false);
        console.log('App initialization complete');
      }
    };

    initializeApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN') {
        const user = await getCurrentUser();
        setUser(user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleAuthSuccess = (loggedInUser: User) => {
    console.log('Auth success, setting user:', loggedInUser);
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    await logout();
    setUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'studio':
        return <Studio />;
      case 'products':
        return <Products />;
      case 'campaigns':
        return <Campaigns />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings user={user} onUpdateUser={setUser} />;
      default:
        return <Dashboard />;
    }
  };

  console.log('App render - isLoading:', isLoading, 'user:', user, 'dbConnectionStatus:', dbConnectionStatus, 'error:', error);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <ProductProvider>
      <div className="flex h-screen bg-gray-100 text-black font-eina">
        {dbConnectionStatus === false && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
            Database connection failed. Please check your configuration.
          </div>
        )}
        {user ? (
          <>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} user={user} />
            <main className="flex-1 overflow-y-auto p-8">
              {renderContent()}
            </main>
          </>
        ) : (
          <div className="w-full">
            <AuthForms onAuthSuccess={handleAuthSuccess} />
          </div>
        )}
      </div>
    </ProductProvider>
  );
}

export default App;