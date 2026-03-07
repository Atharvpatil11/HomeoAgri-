import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlantProvider } from './context/PlantContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CaptureImage from './pages/CaptureImage';
import AutomationSettings from './pages/AutomationSettings';
import DataRecords from './pages/DataRecords';
import GrowthGraph from './pages/GrowthGraph';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MedicineAnalysis from './pages/MedicineAnalysis';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return children;
};

// Main Layout Component
const MainLayout = ({ children }) => {
    // Initialize based on screen width
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile && !sidebarOpen) {
                setSidebarOpen(true);
            } else if (mobile && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="main-content" style={{ display: 'flex', position: 'relative' }}>
                <Sidebar isOpen={sidebarOpen} />

                {/* Mobile Backdrop */}
                {sidebarOpen && isMobile && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            top: '64px',
                            left: 0,
                            width: '100%',
                            height: 'calc(100vh - 64px)',
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 35
                        }}
                    />
                )}

                <main style={{ flex: 1, paddingBottom: '3rem', width: '100%' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <PlantProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
                        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />

                        {/* Public Route: Dashboard */}
                        <Route path="/" element={
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        } />

                        {/* Protected Routes */}
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Routes>
                                        <Route path="/capture" element={<CaptureImage />} />

                                        <Route path="/growth" element={<GrowthGraph />} />
                                        <Route path="/records" element={<DataRecords />} />
                                        <Route path="/settings" element={<AutomationSettings />} />
                                        <Route path="/medicine-analysis" element={<MedicineAnalysis />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="*" element={<div style={{ padding: '2rem' }}>Page not found</div>} />
                                    </Routes>
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Router>
            </PlantProvider>
        </AuthProvider>
    );
};

export default App;
