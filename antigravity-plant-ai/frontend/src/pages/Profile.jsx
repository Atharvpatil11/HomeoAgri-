import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Save, CheckCircle, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        phone: '+91 98765 43210', // Mock data
        location: 'Pune, Maharashtra', // Mock data
        bio: 'Medicinal botanical researcher specializing in homoeopathic specimen analysis.',
        notifications: true
    });

    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setIsEditing(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    return (
        <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <div className="page-title">
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>My Profile</h2>
                    <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Manage your account settings and personal information</p>
                </div>
                {!isEditing ? (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn" onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </header>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                {/* Left Column: Avatar & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontSize: '3rem',
                                fontWeight: 700
                            }}>
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <button style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                background: 'var(--primary)',
                                color: 'white',
                                border: '4px solid white',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}>
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{user?.full_name}</h3>
                        <p style={{ color: 'var(--text-light)', margin: 0 }}>{user?.email}</p>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <span style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <CheckCircle size={14} /> Verified Member
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={20} color="var(--primary)" /> Account Security
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-light)' }}>Two-Factor Auth</span>
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Disabled</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-light)' }}>Password Strength</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>Strong</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Personal Information</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    type="text"
                                    readOnly={!isEditing}
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        background: isEditing ? 'white' : '#f8fafc',
                                        outline: 'none',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    type="email"
                                    readOnly={!isEditing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        background: isEditing ? 'white' : '#f8fafc',
                                        outline: 'none',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    type="text"
                                    readOnly={!isEditing}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        background: isEditing ? 'white' : '#f8fafc',
                                        outline: 'none',
                                        fontSize: '0.95rem'
                                    }}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                <input
                                    type="text"
                                    readOnly={!isEditing}
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        background: isEditing ? 'white' : '#f8fafc',
                                        outline: 'none',
                                        fontSize: '0.95rem'
                                    }}
                                    placeholder="City, Province"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Bio</label>
                        <textarea
                            readOnly={!isEditing}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                background: isEditing ? 'white' : '#f8fafc',
                                outline: 'none',
                                fontSize: '0.95rem',
                                minHeight: '100px',
                                resize: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {!formData.phone || !formData.location ? (
                        <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '10px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'white',
                                color: 'var(--primary)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontWeight: 700,
                                fontSize: '0.8rem'
                            }}>
                                Goal
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 500 }}>
                                Complete your profile to get a personalized botanical research guide!
                            </span>
                        </div>
                    ) : (
                        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle size={20} color="#15803d" />
                            <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                                Senior Researcher: All set! You are receiving full botanical insights.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
