import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { usePlantContext } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Leaf, Camera, PlusCircle, Activity, Layout,
    AlertTriangle, CheckCircle2, TrendingUp, Info,
    Calendar, Map, ThermometerSun, Droplets, History,
    ShieldCheck, Pill, ArrowUpRight, X, Upload, RefreshCw
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { plants, loading, activeAlerts, dismissAlert, scanCount, addPlant } = usePlantContext();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showAddPlantModal, setShowAddPlantModal] = useState(false);


    // Add Plant Form State
    const [newPlant, setNewPlant] = useState({
        name: '', species: '', date: '', location: '', image: null
    });
    const webcamRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);



    const handleCapture = (e) => {
        e.preventDefault();
        const imageSrc = webcamRef.current.getScreenshot();
        setNewPlant({ ...newPlant, image: imageSrc });
        setIsCameraOpen(false);
    };

    const handleRetake = () => {
        setNewPlant({ ...newPlant, image: null });
        setIsCameraOpen(false);
    };

    const handleAddPlantConfig = (e) => {
        e.preventDefault();
        const plantData = {
            ...newPlant,
            status: 'Healthy',
            height: Math.floor(Math.random() * 50) + 10, // Mock initial height
            health_score: 100,
            timestamp: new Date().toLocaleString()
        };
        addPlant(plantData);
        alert("New Plant Added Successfully!");
        setShowAddPlantModal(false);
        setNewPlant({ name: '', species: '', date: '', location: '', image: null });
    };



    if (loading) return <div className="page-container">Loading Greenhouse Data...</div>;

    // Dynamic Stats Calculation
    const totalPlants = plants.length;
    const diseasedCount = plants.filter(p => p.status !== 'Healthy').length;
    const healthyCount = totalPlants - diseasedCount;
    const totalScans = scanCount;

    const latestScan = plants[0] || {
        name: 'No Scan Yet',
        species: 'Awaiting analysis',
        status: 'N/A',
        health_score: 0,
        height: 0,
        timestamp: '---',
        location: '---'
    };

    // Distribution percentages
    const healthyPerc = totalPlants ? Math.round((healthyCount / totalPlants) * 100) : 0;
    const diseasedPerc = totalPlants ? Math.round((diseasedCount / totalPlants) * 100) : 0;

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div className="page-title">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Layout color="var(--primary)" /> HomeoAgri Dashboard
                    </h2>
                    <p>Smart Monitoring & Automated Botanical Diagnostics</p>
                </div>
                <div className="user-greet">
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Welcome back, </span>
                    <span style={{ fontWeight: 700 }}>{user?.username || 'Researcher'}</span>
                </div>
            </header>

            {/* Quick Actions Row */}
            <div className="quick-actions">
                <button className="action-btn" onClick={() => navigate('/capture')}>
                    <Camera size={24} /> <span>Scan Plant</span>
                </button>
                <button className="action-btn" onClick={() => setShowAddPlantModal(true)}>
                    <PlusCircle size={24} /> <span>Add Plant</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/medicine-analysis')}>
                    <Pill size={24} /> <span>Medicine Analysis</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/growth')}>
                    <Activity size={24} /> <span>Growth Graph</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/records')}>
                    <History size={24} /> <span>View Records</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f0fdf4', color: '#166534' }}><Leaf /></div>
                    <div className="stat-info">
                        <div className="label">Total PlantsMonitored</div>
                        <div className="value">{totalPlants}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0369a1' }}><History /></div>
                    <div className="stat-info">
                        <div className="label">Total Scans</div>
                        <div className="value">{totalScans}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#065f46' }}><ShieldCheck /></div>
                    <div className="stat-info">
                        <div className="label">Healthy</div>
                        <div className="value">{healthyCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef2f2', color: '#991b1b' }}><AlertTriangle /></div>
                    <div className="stat-info">
                        <div className="label">Diseased</div>
                        <div className="value">{diseasedCount}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-main">
                {/* Left Column */}
                <div className="dashboard-content">

                    {/* Latest Scan */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Latest Acquisition</h3>
                            <button className="btn-text" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Details <ArrowUpRight size={14} /></button>
                        </div>
                        <div className="latest-scan-row">
                            <img
                                src={latestScan.image || 'https://images.unsplash.com/photo-1528563351369-0268ec35ded7?auto=format&fit=crop&w=400'}
                                alt="Recent"
                                className="scan-image"
                            />
                            <div className="scan-details">
                                <div className="scan-item">
                                    <div className="label">Specimen</div>
                                    <div className="val">{latestScan.name}</div>
                                </div>
                                <div className="scan-item">
                                    <div className="label">AI Status</div>
                                    <div className="val" style={{ color: latestScan.status === 'Healthy' ? 'var(--primary)' : 'var(--danger)' }}>
                                        {latestScan.status}
                                    </div>
                                </div>
                                <div className="scan-item">
                                    <div className="label">Confidence Score</div>
                                    <div className="val">{latestScan.health_score || 0}%</div>
                                </div>
                                <div className="scan-item">
                                    <div className="label">Timestamp</div>
                                    <div className="val" style={{ fontSize: '0.8rem' }}>{latestScan.timestamp}</div>
                                </div>
                                <div className="scan-item">
                                    <div className="label">Latest Height</div>
                                    <div className="val">{latestScan.height} cm</div>
                                </div>
                                <div className="scan-item">
                                    <div className="label">Locality</div>
                                    <div className="val">{latestScan.location}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Growth & Distribution */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="section-card">
                            <div className="section-header">
                                <h3>Growth Status</h3>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>+14.2%</div>
                                <div className="trend-indicator trend-up">
                                    <TrendingUp size={16} /> growth percentage
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-around' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Avg Height</div>
                                        <div style={{ fontWeight: 700 }}>52.4 cm</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Trend Indicator</div>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Stable</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-header">
                                <h3>Health Distribution</h3>
                            </div>
                            <div className="distribution-chart">
                                <div style={{ width: `${healthyPerc}%`, background: '#10b981' }}></div>
                                <div style={{ width: `${diseasedPerc}%`, background: '#f59e0b' }}></div>
                                <div style={{ width: '0%', background: '#ef4444' }}></div>
                            </div>
                            <div className="legend">
                                <span>Healthy ({healthyPerc}%)</span>
                                <span>Diseased ({diseasedPerc}%)</span>
                                <span>Critical (0%)</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
                                *Live calculation from neural network metrics.
                            </p>
                        </div>
                    </div>



                </div>

                {/* Right Column (Sidebar) */}
                <div className="dashboard-sidebar">

                    {/* Alerts */}
                    <div className="section-card" style={{ padding: '1rem' }}>
                        <div className="section-header">
                            <h3>Alert Center</h3>
                            <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px' }}>{activeAlerts.length} Active</span>

                            {/* Add Plant Modal */}
                            {showAddPlantModal && (
                                <div className="modal-overlay" style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                                }}>
                                    <div className="modal-content" style={{
                                        background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative',
                                        maxHeight: '90vh', overflowY: 'auto'
                                    }}>
                                        <button onClick={() => setShowAddPlantModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <X size={24} />
                                        </button>
                                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Add New Plant</h3>
                                        <form onSubmit={handleAddPlantConfig}>
                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Plant Name</label>
                                                <input required type="text" value={newPlant.name} onChange={e => setNewPlant({ ...newPlant, name: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="e.g. Aloe Vera" />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Plant Type/Species</label>
                                                <input required type="text" value={newPlant.species} onChange={e => setNewPlant({ ...newPlant, species: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="e.g. Succulent" />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Planting Date</label>
                                                <input required type="date" value={newPlant.date} onChange={e => setNewPlant({ ...newPlant, date: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location</label>
                                                <input required type="text" value={newPlant.location} onChange={e => setNewPlant({ ...newPlant, location: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="e.g. Garden Row 3" />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Plant Image (Required)</label>

                                                {!newPlant.image && !isCameraOpen && (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <button type="button" onClick={() => setIsCameraOpen(true)} className="btn" style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Camera size={24} color="var(--primary)" />
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Open Camera</span>
                                                        </button>
                                                        <div style={{ position: 'relative' }}>
                                                            <button type="button" className="btn" style={{ width: '100%', height: '100%', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Upload size={24} color="var(--primary)" />
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Upload Image</span>
                                                            </button>
                                                            <input type="file" accept="image/*" onChange={e => {
                                                                if (e.target.files[0]) {
                                                                    setNewPlant({ ...newPlant, image: URL.createObjectURL(e.target.files[0]) });
                                                                }
                                                            }}
                                                                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                                                        </div>
                                                    </div>
                                                )}

                                                {isCameraOpen && (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', background: 'black' }}>
                                                            <Webcam
                                                                audio={false}
                                                                ref={webcamRef}
                                                                screenshotFormat="image/jpeg"
                                                                width="100%"
                                                                videoConstraints={{ facingMode: "environment" }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                                            <button type="button" onClick={() => setIsCameraOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                                            <button type="button" onClick={handleCapture} style={{ padding: '0.5rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                                <Camera size={18} /> Capture
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {newPlant.image && (
                                                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <img src={newPlant.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                                                        <button type="button" onClick={handleRetake} style={{
                                                            position: 'absolute', bottom: '10px', right: '10px',
                                                            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '20px',
                                                            padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}>
                                                            <RefreshCw size={14} /> Retake
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                Save Plant
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}


                        </div>
                        {activeAlerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                                <p>All specimens healthy.</p>
                            </div>
                        ) : (
                            activeAlerts.map(alert => (
                                <div key={alert.id} className={`alert-item alert-${alert.type === 'danger' ? 'danger' : 'warning'}`} style={{ position: 'relative' }}>
                                    {alert.type === 'danger' ? <AlertTriangle size={18} /> : <Info size={18} />}
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>{alert.message}</div>
                                    <X
                                        size={14}
                                        style={{ cursor: 'pointer', opacity: 0.5, position: 'absolute', top: '8px', right: '8px' }}
                                        onClick={() => dismissAlert(alert.id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Acquisition Timeline</h3>
                        </div>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Scanned Red Heart Sample</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>14:55 | South Farm Lab</div>
                            </div>
                            <div className="timeline-item">
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>System Calibration Complete</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>12:30 | Core AI Engine</div>
                            </div>
                            <div className="timeline-item">
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>New Batch Added</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Oct 24 | Greenhouse Zone A</div>
                            </div>
                        </div>
                    </div>

                    <div className="section-card" style={{ background: 'var(--primary)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ShieldCheck size={32} />
                            <div>
                                <div style={{ fontWeight: 800 }}>Pro License Active</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>AI Precision: 99.8%</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;

