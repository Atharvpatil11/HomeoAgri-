import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Leaf, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            showToast(location.state.message, 'success');
            // Clear location state to prevent toast on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const showToast = (message, type) => {
        setToast({ message, type });
        // Auto hide handled by Toast component, but we can clear state if needed
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            console.log("Attempting login with:", email);
            await login(email, password);
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error("Login UI Error:", err);
            const errorMsg = typeof err.response?.data?.detail === 'string'
                ? err.response.data.detail
                : 'Invalid email or password. Please try again.';
            showToast(errorMsg, 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-overlay"></div>

            {toast && (
                <div className="toast-container">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <Leaf size={32} />
                    </div>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your HomeoAgri account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <a href="#" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="spin" /> Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    <style>{`
                        .spin { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/register" className="auth-link">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
