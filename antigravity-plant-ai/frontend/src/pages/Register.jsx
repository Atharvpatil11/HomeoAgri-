import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Leaf, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';
import './Login.css'; // Reusing Login styles for consistency

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const { register } = useAuth();
    const navigate = useNavigate();

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            console.log("Attempting registration with:", { email, fullName });
            await register(email, password, fullName);
            showToast('Account created! Welcome to HomeoAgri.', 'success');
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error("Registration UI Error:", err);
            let errorMsg = 'Registration failed. Please check your details.';

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.data && err.response.data.detail) {
                    errorMsg = err.response.data.detail;
                    if (Array.isArray(errorMsg)) { // Handle validation errors which might be an array
                        errorMsg = errorMsg.map(e => e.msg).join(', ');
                    }
                }
            } else if (err.request) {
                // The request was made but no response was received
                errorMsg = 'Network Error. Cannot connect to server. Please check your connection and ensure the server is running.';
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMsg = err.message;
            }

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
                    <h2 className="login-title">Join HomeoAgri</h2>
                    <p className="login-subtitle">Connect with a global network of botanical medicinal research.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

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

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="spin" /> Creating Account...
                            </>
                        ) : (
                            <>
                                Sign Up <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    <style>{`
                        .spin { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
