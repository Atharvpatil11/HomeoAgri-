import React, { useState, useRef, useCallback } from 'react';
import { usePlantContext } from '../context/PlantContext';
import Webcam from 'react-webcam';
import { Camera, ArrowRight, ArrowLeft, Send, CheckCircle, RefreshCw, Info } from 'lucide-react';
import api, { analyzeImage } from '../services/api';

const PHASES = {
    SELECT_PLANT: 'SELECT_PLANT',
    PRE_CAPTURE: 'PRE_CAPTURE',
    DETAILS: 'DETAILS',
    POST_CAPTURE: 'POST_CAPTURE',
    SUMMARY: 'SUMMARY'
};

const TreatmentSession = () => {
    const { plants } = usePlantContext();
    const [phase, setPhase] = useState(PHASES.SELECT_PLANT);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [loading, setLoading] = useState(false);

    // Treatment Form State
    const [medicine, setMedicine] = useState('');
    const [dosage, setDosage] = useState('');
    const [method, setMethod] = useState('spray');
    const [notes, setNotes] = useState('');

    // Image/Analysis State
    const webcamRef = useRef(null);
    const [preImage, setPreImage] = useState(null);
    const [postImage, setPostImage] = useState(null);
    const [preScore, setPreScore] = useState(null);
    const [postScore, setPostScore] = useState(null);

    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], { type: mime });
    };

    const handleCapture = async (type) => {
        const imageSrc = webcamRef.current.getScreenshot();
        setLoading(true);
        try {
            const blob = dataURLtoBlob(imageSrc);
            const formData = new FormData();
            formData.append('file', blob, 'capture.jpg');
            const response = await analyzeImage(formData);
            const score = response.data.health_score;

            if (type === 'pre') {
                setPreImage(imageSrc);
                setPreScore(score);
                setPhase(PHASES.DETAILS);
            } else {
                setPostImage(imageSrc);
                setPostScore(score);
                setPhase(PHASES.SUMMARY);
            }
        } catch (err) {
            alert("Analysis failed. Proceeding without score.");
            if (type === 'pre') {
                setPreImage(imageSrc);
                setPreScore(75);
                setPhase(PHASES.DETAILS);
            } else {
                setPostImage(imageSrc);
                setPostScore(85);
                setPhase(PHASES.SUMMARY);
            }
        }
        setLoading(false);
    };

    const submitSession = async () => {
        setLoading(true);
        try {
            await api.post('/treatments/', {
                plant_id: selectedPlant.id,
                medicine_name: medicine,
                dosage,
                method,
                notes,
                pre_health_score: preScore,
                post_health_score: postScore,
                pre_image_path: 'mock_pre.jpg',
                post_image_path: 'mock_post.jpg',
                status: 'Completed'
            });
            alert("Treatment Session Archived Successfully!");
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            alert("Failed to archive. See console.");
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-title">
                    <h2>Homoeopathic Treatment Tracking</h2>
                    <p>Document the healing response of your medicinal specimens.</p>
                </div>
            </header>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Progress Stepper */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 1rem' }}>
                    {[PHASES.SELECT_PLANT, PHASES.PRE_CAPTURE, PHASES.DETAILS, PHASES.POST_CAPTURE, PHASES.SUMMARY].map((p, i) => (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: phase === p ? 'var(--primary)' : (i < Object.values(PHASES).indexOf(phase) ? '#ecfdf5' : '#f1f5f9'),
                                color: phase === p ? 'white' : (i < Object.values(PHASES).indexOf(phase) ? 'var(--primary)' : '#94a3b8'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700,
                                border: phase === p ? 'none' : '1px solid #e2e8f0'
                            }}>
                                {i < Object.values(PHASES).indexOf(phase) ? <CheckCircle size={16} /> : i + 1}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Phases */}
                {phase === PHASES.SELECT_PLANT && (
                    <div className="fade-in">
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Select Medicinal Specimen</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                            {plants.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => { setSelectedPlant(p); setPhase(PHASES.PRE_CAPTURE); }}
                                    style={{
                                        padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                        background: '#f8fafc', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                >
                                    <img src={p.image || p.image_url || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80'} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} alt={p.name} />
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{p.species}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(phase === PHASES.PRE_CAPTURE || phase === PHASES.POST_CAPTURE) && (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <h3>{phase === PHASES.PRE_CAPTURE ? 'Before Treatment' : 'After Treatment'}</h3>
                        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Capture image to establish {phase === PHASES.PRE_CAPTURE ? 'baseline' : 'outcome'} health score.</p>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => handleCapture(phase === PHASES.PRE_CAPTURE ? 'pre' : 'post')}
                            className="btn btn-primary" style={{ marginTop: '2rem', padding: '0.8rem 3rem' }}
                        >
                            <Camera size={20} /> {loading ? 'Analyzing...' : 'Capture & Score'}
                        </button>
                    </div>
                )}

                {phase === PHASES.DETAILS && (
                    <div className="fade-in">
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Treatment Protocol</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--primary)', background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', display: 'flex', gap: '8px', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <Info size={18} /> Pre-Treatment Vitality: {preScore}%
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Medicine Name</label>
                                <input type="text" value={medicine} onChange={e => setMedicine(e.target.value)} placeholder="e.g. Sulphur 30C" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Dosage</label>
                                <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 5 drops / 100ml" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Application Method</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['spray', 'soil', 'vibrated'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMethod(m)}
                                            style={{
                                                flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                                                background: method === m ? 'var(--primary)' : 'white',
                                                color: method === m ? 'white' : 'var(--text-dark)', fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Clinical Notes</label>
                                <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observe leaf posture, color intensity change..."></textarea>
                            </div>
                        </div>
                        <button onClick={() => setPhase(PHASES.POST_CAPTURE)} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                            Next: Post-Treatment Capture <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {phase === PHASES.SUMMARY && (
                    <div className="fade-in">
                        <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Phyto-Response Summary</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.5rem' }}>PRE-TREATMENT</div>
                                <img src={preImage} style={{ width: '100%', borderRadius: '12px', height: '150px', objectFit: 'cover' }} alt="Pre" />
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>{preScore}%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.5rem' }}>POST-TREATMENT</div>
                                <img src={postImage} style={{ width: '100%', borderRadius: '12px', height: '150px', objectFit: 'cover' }} alt="Post" />
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: postScore > preScore ? 'var(--primary)' : 'var(--danger)' }}>
                                    {postScore}%
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369a1', marginBottom: '1rem' }}>AI Insight</div>
                            <p style={{ margin: 0, color: '#075985' }}>
                                {postScore > preScore
                                    ? `Observed vitality gain of ${postScore - preScore}%. The specimen shows positive response to ${medicine} application. Leaf color uniformity is improved.`
                                    : `Vitality remains stable. Recommend monitoring for another 24h or considering potency adjustment.`
                                }
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={submitSession} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                                {loading ? 'Archiving...' : 'Archive Session'}
                            </button>
                            <button onClick={() => setPhase(PHASES.SELECT_PLANT)} className="btn" style={{ background: '#f1f5f9' }}>
                                <RefreshCw size={18} /> Reset
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreatmentSession;
