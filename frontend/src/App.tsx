import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSplash from './components/LoadingSplash';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Batches from './pages/Batches';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import { getSummary } from './api';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Make initial API call to warm up the system and hide splash when ready
    const initializeApp = async () => {
      try {
        // Add a minimum loading time for better UX
        await Promise.all([
          getSummary(),
          new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5s loading
        ]);
        setIsLoading(false);
      } catch (err) {
        // Even if API fails, hide loading after delay to prevent infinite loading
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    initializeApp();
  }, []);

  return (
    <>
      <LoadingSplash isVisible={isLoading} />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </Router>
    </>
  );
};

export default App;
