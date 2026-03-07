import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Save, Bell, Mail, Droplets } from 'lucide-react';

const AutomationSettings = () => {
    const [settings, setSettings] = useState({
        diseaseAlerts: true,
        autoWatering: false,
        emailNotifs: true,
        smsNotifs: false,
        waterThreshold: 30
    });

    const [saving, setSaving] = useState(false);

    const toggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-title">
                    <h2>Automation Settings</h2>
                    <p>Configure smart alerts and automated analysis.</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            <div style={{ maxWidth: '800px' }}>

                {/* Alerts Section */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={20} /> Monitoring Alerts
                    </h3>

                    <div className="setting-item" onClick={() => toggle('diseaseAlerts')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', cursor: 'pointer' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Disease Detection Alerts</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Get notified immediately when AI detects health issues</div>
                        </div>
                        {settings.diseaseAlerts ? <ToggleRight size={40} color="var(--primary)" /> : <ToggleLeft size={40} color="#cbd5e1" />}
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={20} /> Notification Channels
                    </h3>

                    <div className="setting-item" onClick={() => toggle('emailNotifs')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', cursor: 'pointer' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Email Notifications</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Send weekly reports to registered email</div>
                        </div>
                        {settings.emailNotifs ? <ToggleRight size={40} color="var(--primary)" /> : <ToggleLeft size={40} color="#cbd5e1" />}
                    </div>
                </div>



            </div>
        </div>
    );
};

export default AutomationSettings;
