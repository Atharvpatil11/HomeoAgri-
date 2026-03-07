import React, { useState, useRef, useMemo } from 'react';
import { usePlantContext } from '../context/PlantContext';
import Webcam from 'react-webcam';
import {
    Pill, Camera, Upload, ArrowRight, ArrowLeft, Save,
    CheckCircle2, TrendingUp, Leaf, Activity, AlertTriangle,
    RefreshCw, Beaker, BarChart3, Clock, Heart, Sprout,
    ShieldCheck, X, Eye, ChevronRight, PlusCircle
} from 'lucide-react';
import './MedicineAnalysis.css';

const MedicineAnalysis = () => {
    const { plants, treatments, addTreatment, addPlant, removePlant } = usePlantContext();
    const [step, setStep] = useState(1); // 1: details, 2: images, 3: analysis, 4: results
    const [cameraTarget, setCameraTarget] = useState(null);
    const webcamRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [showAddPlantModal, setShowAddPlantModal] = useState(false);
    const [newPlant, setNewPlant] = useState({ name: '', species: '' });

    const handleAddPlantConfig = (e) => {
        e.preventDefault();
        const plantData = {
            ...newPlant,
            status: 'Healthy',
            height: 15,
            health_score: 100,
            timestamp: new Date().toLocaleString()
        };
        addPlant(plantData);
        setShowAddPlantModal(false);
        setNewPlant({ name: '', species: '' });
    };

    // Medicine form
    const [medicine, setMedicine] = useState({
        name: '',
        type: 'homeopathic',
        dosage: '',
        method: 'spray',
        startDate: '',
        stopDate: '',
        plantId: '',
        notes: ''
    });

    // Images
    const [images, setImages] = useState({
        before: null,
        during: null,
        after: null
    });

    // Mock AI Results
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const selectedPlant = plants.find(p => String(p.id) === String(medicine.plantId));

    const handleImageCapture = (slot) => {
        if (webcamRef.current) {
            const src = webcamRef.current.getScreenshot();
            setImages(prev => ({ ...prev, [slot]: src }));
            setCameraTarget(null);
        }
    };

    const handleImageUpload = (slot, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => ({ ...prev, [slot]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = () => {
        // Validation: Check if uploaded images are duplicates
        const uploadedSlots = Object.keys(images).filter(key => images[key]);
        const uniqueImages = new Set(uploadedSlots.map(key => images[key]));

        if (uploadedSlots.length > 1 && uniqueImages.size < uploadedSlots.length) {
            alert("Analysis Error: Duplicate images detected! The images uploaded for different treatment stages appear to be exactly the same. Please upload distinct images for 'Before', 'During', or 'After' to proceed with the analysis.");
            return;
        }

        setAnalyzing(true);
        // Simulate AI analysis
        setTimeout(() => {
            const effectiveness = Math.floor(Math.random() * 35) + 60;
            const heightChange = (Math.random() * 8 + 2).toFixed(1);
            const leafHealth = Math.floor(Math.random() * 30) + 65;
            const diseaseReduction = Math.floor(Math.random() * 40) + 50;
            const growthRate = (Math.random() * 3 + 1).toFixed(1);

            setAnalysisResult({
                effectiveness,
                heightChange: `+${heightChange} cm`,
                leafHealth,
                diseaseReduction,
                growthRate: `${growthRate}x`,
                sideEffects: effectiveness > 80 ? 'None detected' : 'Minor leaf discoloration',
                recovery: effectiveness > 75 ? 'Full Recovery' : effectiveness > 50 ? 'Partial Recovery' : 'Needs Attention',
                recommendation: effectiveness > 75
                    ? `Continue ${medicine.name} at current dosage. Plant shows excellent response.`
                    : `Consider adjusting dosage of ${medicine.name}. Monitor for 1 more week before switching.`,
                metrics: {
                    beforeHealth: Math.floor(Math.random() * 30) + 20,
                    duringHealth: Math.floor(Math.random() * 25) + 45,
                    afterHealth: leafHealth,
                    beforeHeight: 25,
                    duringHeight: 25 + parseFloat(heightChange) * 0.4,
                    afterHeight: 25 + parseFloat(heightChange)
                }
            });
            setStep(4);
            setAnalyzing(false);
        }, 2500);
    };

    const handleSaveAll = () => {
        const treatmentData = {
            plantId: medicine.plantId,
            plantName: selectedPlant?.name || 'Unknown',
            name: medicine.name,
            dosage: medicine.dosage,
            method: medicine.method,
            type: medicine.type,
            startDate: medicine.startDate,
            stopDate: medicine.stopDate,
            status: 'Completed',
            effectiveness: analysisResult?.effectiveness,
            images,
            notes: medicine.notes
        };
        addTreatment(treatmentData);
        alert('Medicine analysis saved successfully! Data is now available in View Records.');
    };

    const stepLabels = [
        { num: 1, label: 'Medicine Details', icon: Pill },
        { num: 2, label: 'Image Capture', icon: Camera },
        { num: 3, label: 'AI Analysis', icon: Activity },
        { num: 4, label: 'Results', icon: BarChart3 }
    ];

    const getScoreColor = (score) => {
        if (score >= 80) return { bg: '#ecfdf5', color: '#059669', ring: '#10b981' };
        if (score >= 60) return { bg: '#fffbeb', color: '#b45309', ring: '#f59e0b' };
        return { bg: '#fef2f2', color: '#dc2626', ring: '#ef4444' };
    };

    return (
        <div className="page-container medicine-analysis">
            <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div className="page-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
                            <Beaker size={24} />
                        </div>
                        <h2 style={{ margin: 0 }}>Medicine Analysis</h2>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#64748b' }}>
                        Analyze treatment effectiveness and track plant recovery
                    </p>
                </div>
            </header>

            {/* Stepper */}
            <div className="ma-stepper">
                {stepLabels.map((s) => (
                    <button
                        key={s.num}
                        className={`ma-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
                        onClick={() => { if (s.num <= step) setStep(s.num); }}
                    >
                        <span className="ma-step-number">
                            {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                        </span>
                        <span>{s.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Step 1: Medicine Details ── */}
            {step === 1 && (
                <div className="ma-two-col-grid">
                    <div className="ma-card">
                        <div className="ma-card-header">
                            <div className="icon-wrap"><Pill size={20} /></div>
                            Medicine Information
                        </div>
                        <div className="ma-card-body">
                            <div className="ma-form-grid">
                                <div className="ma-form-group">
                                    <label>Medicine Name</label>
                                    <input className="ma-input" placeholder="e.g. Neem Oil, Sulphur 200CH" value={medicine.name} onChange={e => setMedicine({ ...medicine, name: e.target.value })} />
                                </div>
                                <div className="ma-form-group">
                                    <label>Medicine Type</label>
                                    <select className="ma-input" value={medicine.type} onChange={e => setMedicine({ ...medicine, type: e.target.value })}>
                                        <option value="homeopathic">Homeopathic</option>
                                        <option value="organic">Organic</option>
                                        <option value="chemical">Chemical</option>
                                    </select>
                                </div>
                                <div className="ma-form-group">
                                    <label>Dosage</label>
                                    <input className="ma-input" placeholder="e.g. 5ml, 10 drops" value={medicine.dosage} onChange={e => setMedicine({ ...medicine, dosage: e.target.value })} />
                                </div>
                                <div className="ma-form-group">
                                    <label>Application Method</label>
                                    <select className="ma-input" value={medicine.method} onChange={e => setMedicine({ ...medicine, method: e.target.value })}>
                                        <option value="spray">Foliar Spray</option>
                                        <option value="soil">Soil Application</option>
                                        <option value="water">Water Mix</option>
                                        <option value="injection">Direct Injection</option>
                                    </select>
                                </div>
                                <div className="ma-form-group">
                                    <label>Start Date</label>
                                    <input className="ma-input" type="date" value={medicine.startDate} onChange={e => setMedicine({ ...medicine, startDate: e.target.value })} />
                                </div>
                                <div className="ma-form-group">
                                    <label>Stop Dosage Date</label>
                                    <input className="ma-input" type="date" value={medicine.stopDate} onChange={e => setMedicine({ ...medicine, stopDate: e.target.value })} />
                                </div>
                                <div className="ma-form-group full-width">
                                    <label>Notes</label>
                                    <textarea className="ma-input" rows="3" placeholder="Observations, weather conditions, specific concerns..." value={medicine.notes} onChange={e => setMedicine({ ...medicine, notes: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ma-card">
                        <div className="ma-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="icon-wrap"><Sprout size={20} /></div>
                                Select Plant
                            </div>
                            <button
                                className="ma-btn ma-btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                onClick={() => setShowAddPlantModal(true)}
                                type="button"
                            >
                                <PlusCircle size={14} /> Add Plant
                            </button>
                        </div>
                        <div className="ma-card-body">
                            {plants.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <AlertTriangle size={32} style={{ marginBottom: '0.5rem' }} />
                                    <p>No plants added yet. Please add a plant from the Dashboard first.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
                                    {plants.map(plant => (
                                        <div
                                            key={plant.id}
                                            onClick={() => setMedicine({ ...medicine, plantId: String(plant.id) })}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                padding: '0.85rem', borderRadius: '12px', cursor: 'pointer',
                                                border: String(medicine.plantId) === String(plant.id) ? '2px solid var(--primary)' : '1.5px solid #e2e8f0',
                                                background: String(medicine.plantId) === String(plant.id) ? '#f0fdf4' : 'white',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <img
                                                src={plant.image || plant.image_url || 'https://via.placeholder.com/48'}
                                                alt={plant.name}
                                                style={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{plant.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{plant.species} • {plant.status}</div>
                                            </div>
                                                {String(medicine.plantId) === String(plant.id) && (
                                                    <CheckCircle2 size={22} color="var(--primary)" />
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Are you sure you want to delete ${plant.name}?`)) {
                                                            removePlant(plant.id);
                                                            if (String(medicine.plantId) === String(plant.id)) {
                                                                setMedicine({ ...medicine, plantId: '' });
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        color: '#ef4444', padding: '0.5rem', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                    title="Delete Plant"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ma-nav-buttons" style={{ gridColumn: '1 / -1' }}>
                        <div />
                        <button
                            className="ma-btn ma-btn-primary"
                            onClick={() => setStep(2)}
                            disabled={!medicine.name || !medicine.plantId}
                            style={{ opacity: (!medicine.name || !medicine.plantId) ? 0.5 : 1 }}
                        >
                            Next: Image Capture <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Image Capture ── */}
            {step === 2 && (
                <div>
                    <div className="ma-card" style={{ marginBottom: '1.5rem' }}>
                        <div className="ma-card-header">
                            <div className="icon-wrap"><Camera size={20} /></div>
                            Treatment Image Comparison
                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                                Treating: <strong style={{ color: 'var(--primary)' }}>{selectedPlant?.name || 'Unknown'}</strong>
                            </span>
                        </div>
                        <div className="ma-card-body">
                            <div className="ma-image-grid">
                                {['before', 'during', 'after'].map((slot) => (
                                    <div key={slot} className={`ma-image-slot ${images[slot] ? 'has-image' : ''}`}>
                                        {images[slot] ? (
                                            <>
                                                <img src={images[slot]} alt={slot} />
                                                <div className="image-overlay">
                                                    <button
                                                        onClick={() => setImages(prev => ({ ...prev, [slot]: null }))}
                                                        className="ma-btn ma-btn-secondary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                    >
                                                        <RefreshCw size={14} /> Retake
                                                    </button>
                                                </div>
                                                <div style={{
                                                    position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 3,
                                                    background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.5rem',
                                                    borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase'
                                                }}>
                                                    {slot}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera size={28} color="#94a3b8" />
                                                <div className="slot-label">{slot} Treatment</div>
                                                <div className="slot-hint">Click to capture or upload</div>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <button
                                                        className="ma-btn ma-btn-primary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                        onClick={() => setCameraTarget(slot)}
                                                    >
                                                        <Camera size={14} /> Camera
                                                    </button>
                                                    <label className="ma-btn ma-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        <Upload size={14} /> Upload
                                                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(slot, e)} />
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Camera Modal */}
                    {cameraTarget && (
                        <div style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                        }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', width: '90%', maxWidth: '500px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>Capture {cameraTarget} Image</h4>
                                    <button onClick={() => setCameraTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                                </div>
                                <div style={{ borderRadius: '12px', overflow: 'hidden', background: 'black', marginBottom: '1rem' }}>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        width="100%"
                                        videoConstraints={{ facingMode: "environment" }}
                                    />
                                </div>
                                <button
                                    className="ma-btn ma-btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => handleImageCapture(cameraTarget)}
                                >
                                    <Camera size={18} /> Capture Photo
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="ma-nav-buttons">
                        <button className="ma-btn ma-btn-secondary" onClick={() => setStep(1)}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button
                            className="ma-btn ma-btn-primary"
                            onClick={() => setStep(3)}
                            disabled={!images.before || !images.after}
                            style={{ opacity: (!images.before || !images.after) ? 0.5 : 1 }}
                        >
                            Next: Run Analysis <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 3: AI Analysis ── */}
            {step === 3 && (
                <div className="ma-two-col-grid">
                    <div className="ma-card">
                        <div className="ma-card-header">
                            <div className="icon-wrap"><Eye size={20} /></div>
                            Image Comparison Preview
                        </div>
                        <div className="ma-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: images.during ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
                                {['before', 'during', 'after'].filter(s => images[s]).map(slot => (
                                    <div key={slot} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                                        <img src={images[slot]} alt={slot} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                            color: 'white', padding: '0.5rem', textAlign: 'center',
                                            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                                        }}>
                                            {slot}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="ma-card">
                        <div className="ma-card-header">
                            <div className="icon-wrap"><Activity size={20} /></div>
                            Analysis Configuration
                        </div>
                        <div className="ma-card-body">
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Analyzing:</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <Sprout size={18} color="var(--primary)" />
                                    <span><strong>{selectedPlant?.name}</strong> ({selectedPlant?.species})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <Pill size={18} color="#8b5cf6" />
                                    <span><strong>{medicine.name}</strong> - {medicine.dosage} ({medicine.type})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Clock size={18} color="#f59e0b" />
                                    <span>{medicine.startDate} to {medicine.stopDate}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>AI will analyze:</div>
                                {['Height change detection', 'Leaf health improvement', 'Disease reduction analysis', 'Growth rate change', 'Side effect detection'].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', color: '#475569', fontSize: '0.85rem' }}>
                                        <CheckCircle2 size={16} color="var(--primary)" /> {item}
                                    </div>
                                ))}
                            </div>

                            <button
                                className="ma-btn ma-btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                                onClick={runAnalysis}
                                disabled={analyzing}
                            >
                                {analyzing ? (
                                    <><RefreshCw size={18} className="spin" /> Analyzing Images...</>
                                ) : (
                                    <><Activity size={18} /> Run AI Analysis</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="ma-nav-buttons" style={{ gridColumn: '1 / -1' }}>
                        <button className="ma-btn ma-btn-secondary" onClick={() => setStep(2)}>
                            <ArrowLeft size={18} /> Back
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 4: Results ── */}
            {step === 4 && analysisResult && (
                <div>
                    {/* Top Score + Recovery */}
                    <div className="ma-results-top-grid">
                        <div className="ma-card">
                            <div className="ma-card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div
                                    className="ma-score-ring"
                                    style={{
                                        background: `conic-gradient(${getScoreColor(analysisResult.effectiveness).ring} ${analysisResult.effectiveness * 3.6}deg, #f1f5f9 0deg)`,
                                    }}
                                >
                                    <div style={{
                                        width: '130px', height: '130px', borderRadius: '50%', background: 'white',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span className="score-value" style={{ color: getScoreColor(analysisResult.effectiveness).color }}>
                                            {analysisResult.effectiveness}%
                                        </span>
                                        <span className="score-label">Effectiveness</span>
                                    </div>
                                </div>
                                <div
                                    className="ma-recovery-badge"
                                    style={{
                                        background: getScoreColor(analysisResult.effectiveness).bg,
                                        color: getScoreColor(analysisResult.effectiveness).color
                                    }}
                                >
                                    <ShieldCheck size={18} /> {analysisResult.recovery}
                                </div>
                            </div>
                        </div>

                        <div className="ma-card">
                            <div className="ma-card-header">
                                <div className="icon-wrap"><BarChart3 size={20} /></div>
                                Improvement Metrics
                            </div>
                            <div className="ma-card-body">
                                <div className="ma-metrics-grid">
                                    <div className="ma-metric-card" style={{ background: '#ecfdf5' }}>
                                        <div className="metric-value" style={{ color: '#059669' }}>{analysisResult.heightChange}</div>
                                        <div className="metric-label">Height Growth</div>
                                    </div>
                                    <div className="ma-metric-card" style={{ background: '#f0f9ff' }}>
                                        <div className="metric-value" style={{ color: '#0369a1' }}>{analysisResult.leafHealth}%</div>
                                        <div className="metric-label">Leaf Health</div>
                                    </div>
                                    <div className="ma-metric-card" style={{ background: '#fef3c7' }}>
                                        <div className="metric-value" style={{ color: '#92400e' }}>{analysisResult.diseaseReduction}%</div>
                                        <div className="metric-label">Disease Reduced</div>
                                    </div>
                                    <div className="ma-metric-card" style={{ background: '#ede9fe' }}>
                                        <div className="metric-value" style={{ color: '#6d28d9' }}>{analysisResult.growthRate}</div>
                                        <div className="metric-label">Growth Rate</div>
                                    </div>
                                    <div className="ma-metric-card" style={{ background: analysisResult.sideEffects === 'None detected' ? '#ecfdf5' : '#fef2f2' }}>
                                        <div className="metric-value" style={{ color: analysisResult.sideEffects === 'None detected' ? '#059669' : '#dc2626', fontSize: '0.9rem' }}>
                                            {analysisResult.sideEffects === 'None detected' ? '✓ None' : '⚠ Minor'}
                                        </div>
                                        <div className="metric-label">Side Effects</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts + Timeline */}
                    <div className="ma-results-chart-grid">
                        {/* Health Improvement Chart */}
                        <div className="ma-card">
                            <div className="ma-card-header">
                                <div className="icon-wrap"><TrendingUp size={20} /></div>
                                Health Improvement Graph
                            </div>
                            <div className="ma-card-body">
                                <div className="ma-bar-chart">
                                    {[
                                        { label: 'Before', value: analysisResult.metrics.beforeHealth, color: '#ef4444' },
                                        { label: 'During', value: analysisResult.metrics.duringHealth, color: '#f59e0b' },
                                        { label: 'After', value: analysisResult.metrics.afterHealth, color: '#10b981' }
                                    ].map((bar, i) => (
                                        <div className="ma-bar" key={i}>
                                            <div className="bar-value">{bar.value}%</div>
                                            <div className="bar-fill" style={{ height: `${bar.value * 1.6}px`, background: `linear-gradient(180deg, ${bar.color}, ${bar.color}88)` }} />
                                            <div className="bar-label">{bar.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Treatment Timeline */}
                        <div className="ma-card">
                            <div className="ma-card-header">
                                <div className="icon-wrap"><Clock size={20} /></div>
                                Treatment Timeline
                            </div>
                            <div className="ma-card-body">
                                <div className="ma-timeline">
                                    <div className="ma-timeline-item">
                                        <div className="tl-date">{medicine.startDate || 'Start Date'}</div>
                                        <div className="tl-title">Treatment Started</div>
                                        <div className="tl-desc">Applied {medicine.name} ({medicine.dosage}) via {medicine.method}</div>
                                    </div>
                                    <div className="ma-timeline-item">
                                        <div className="tl-date">Midpoint</div>
                                        <div className="tl-title">Progress Check</div>
                                        <div className="tl-desc">Health improved to {analysisResult.metrics.duringHealth}%</div>
                                    </div>
                                    <div className="ma-timeline-item">
                                        <div className="tl-date">{medicine.stopDate || 'End Date'}</div>
                                        <div className="tl-title">Treatment Completed</div>
                                        <div className="tl-desc">Final health score: {analysisResult.metrics.afterHealth}%. {analysisResult.recovery}</div>
                                    </div>
                                    <div className="ma-timeline-item">
                                        <div className="tl-date">Analysis Complete</div>
                                        <div className="tl-title">AI Recommendation</div>
                                        <div className="tl-desc">{analysisResult.recommendation}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation Card */}
                    <div className="ma-card" style={{ marginBottom: '1.5rem' }}>
                        <div className="ma-card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px' }}>
                            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '12px', flexShrink: 0 }}>
                                <Leaf size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>AI Recommendation</div>
                                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{analysisResult.recommendation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Comparison Side by Side */}
                    <div className="ma-card" style={{ marginBottom: '1.5rem' }}>
                        <div className="ma-card-header">
                            <div className="icon-wrap"><Eye size={20} /></div>
                            Before vs After Comparison
                        </div>
                        <div className="ma-card-body">
                            <div className="ma-before-after-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
                                    {images.before && <img src={images.before} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(239,68,68,0.85)', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>BEFORE</div>
                                </div>
                                <ChevronRight size={32} color="#94a3b8" className="chevron-icon" />
                                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
                                    {images.after && <img src={images.after} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(16,185,129,0.85)', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>AFTER</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="ma-nav-buttons">
                        <button className="ma-btn ma-btn-secondary" onClick={() => setStep(3)}>
                            <ArrowLeft size={18} /> Re-analyze
                        </button>
                        <button className="ma-btn ma-btn-primary" onClick={handleSaveAll}>
                            <Save size={18} /> Save Analysis & Treatment Data
                        </button>
                    </div>
                </div>
            )}

            {/* Full-screen Image Modal */}
            {selectedImage && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
                }} onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Full" style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: '12px' }} />
                    <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={32} />
                    </button>
                </div>
            )}

            {/* Quick Add Plant Modal */}
            {showAddPlantModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300
                }}>
                    <div style={{
                        background: 'white', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '350px', position: 'relative'
                    }}>
                        <button onClick={() => setShowAddPlantModal(false)} type="button" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>
                        <h4 style={{ marginTop: 0, marginBottom: '1.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PlusCircle size={18}/> Add New Plant
                        </h4>
                        <form onSubmit={handleAddPlantConfig}>
                            <div className="ma-form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem', display: 'block' }}>Plant Name</label>
                                <input required className="ma-input" type="text" value={newPlant.name} onChange={e => setNewPlant({ ...newPlant, name: e.target.value })} placeholder="e.g. Aloe Vera" />
                            </div>
                            <div className="ma-form-group" style={{ marginBottom: '1.2rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem', display: 'block' }}>Species</label>
                                <input required className="ma-input" type="text" value={newPlant.species} onChange={e => setNewPlant({ ...newPlant, species: e.target.value })} placeholder="e.g. Succulent" />
                            </div>
                            <button type="submit" className="ma-btn ma-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Save Plant
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineAnalysis;
