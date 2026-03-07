import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlantContext } from '../context/PlantContext';
import Webcam from 'react-webcam';
import {
    Camera, ArrowRight, X, RefreshCw, Upload, MapPin, Info, CheckCircle2,
    AlertTriangle, ThermometerSun, Droplets, Ruler, Save, Sun, Moon,
    Eye, Leaf, Pill, Clock, Layers, ZoomIn, Flower2, Image as ImageIcon,
    ShieldCheck, AlertCircle, ChevronRight
} from 'lucide-react';
import { analyzeImage } from '../services/api';
import './CaptureImage.css';

const CaptureImage = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const { addPlant } = usePlantContext();

    // Core states
    const [step, setStep] = useState('capture'); // capture, details, results
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Distance Estimation
    const [distance, setDistance] = useState(1.5);
    const [distanceStatus, setDistanceStatus] = useState('perfect');
    const [isLowLight, setIsLowLight] = useState(false);
    const [isPiPActive, setIsPiPActive] = useState(false);

    // ── Multi-Angle Capture ──
    const angleSlots = [
        { key: 'front', label: 'Front View', icon: Camera, required: true, hint: 'Capture the plant from the front, showing full height' },
        { key: 'side', label: 'Side View', icon: Layers, required: true, hint: 'Capture a side profile of the plant' },
        { key: 'leafCloseup', label: 'Leaf Close-up', icon: Leaf, required: true, hint: 'Focus on a single leaf in detail' },
        { key: 'fruitFlower', label: 'Fruit / Flower', icon: Flower2, required: false, hint: 'Capture fruit or flower if present (optional)' }
    ];
    const [multiImages, setMultiImages] = useState({ front: null, side: null, leafCloseup: null, fruitFlower: null });
    const [activeAngle, setActiveAngle] = useState('front');
    const [captureMode, setCaptureMode] = useState('camera'); // camera | gallery

    // ── Quality Controls ──
    const [qualityScores, setQualityScores] = useState({
        front: null, side: null, leafCloseup: null, fruitFlower: null
    });

    // ── Treatment Phase Tag ──
    const [treatmentPhase, setTreatmentPhase] = useState('none'); // none, before, during, after

    // Metadata
    const [metadata, setMetadata] = useState({
        captureDate: '',
        captureTime: '',
        deviceInfo: navigator.userAgent.split(') ')[0] + ')',
        gpsLocation: 'Detecting...',
        gpsCoords: null
    });

    // Form inputs
    const [formData, setFormData] = useState({
        plantName: '',
        plantType: 'Medicinal',
        growthStage: 'Vegetative',
        locationType: 'Farm',
        symptoms: [],
        sunlight: 'Partial Shade',
        watering: 'Twice Weekly',
        soilType: 'Loamy',
        temperature: 25,
        humidity: 60,
        treatmentMedicine: '',
        treatmentDosage: '',
        treatmentMethod: 'Spray',
        treatmentStartDate: '',
        treatmentStopDate: '',
        notes: '',
        referenceObjectConfirmed: false
    });

    // Distance enforcement
    useEffect(() => {
        if (distance < 0.5) setDistanceStatus('too-close');
        else if (distance > 3.0) setDistanceStatus('too-far');
        else setDistanceStatus('perfect');
    }, [distance]);

    // GPS auto-detect
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setMetadata(prev => ({
                    ...prev,
                    gpsLocation: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
                    gpsCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                })),
                () => setMetadata(prev => ({ ...prev, gpsLocation: 'Permission Denied' }))
            );
        }
    }, []);

    // Auto-stamp date/time on first capture
    const stampDateTime = () => {
        const now = new Date();
        setMetadata(prev => ({
            ...prev,
            captureDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            captureTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));
    };

    // ── Blur Detection (Canvas-based edge detection) ──
    const detectBlur = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const w = 100, h = 75; // downscale for speed
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;

                // Laplacian variance for blur detection
                let sum = 0, sumSq = 0, count = 0;
                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        const idx = (y * w + x) * 4;
                        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                        const above = ((y - 1) * w + x) * 4;
                        const below = ((y + 1) * w + x) * 4;
                        const left = (y * w + (x - 1)) * 4;
                        const right = (y * w + (x + 1)) * 4;
                        const gAbove = data[above] * 0.299 + data[above + 1] * 0.587 + data[above + 2] * 0.114;
                        const gBelow = data[below] * 0.299 + data[below + 1] * 0.587 + data[below + 2] * 0.114;
                        const gLeft = data[left] * 0.299 + data[left + 1] * 0.587 + data[left + 2] * 0.114;
                        const gRight = data[right] * 0.299 + data[right + 1] * 0.587 + data[right + 2] * 0.114;
                        const laplacian = gAbove + gBelow + gLeft + gRight - 4 * gray;
                        sum += laplacian;
                        sumSq += laplacian * laplacian;
                        count++;
                    }
                }
                const variance = (sumSq / count) - Math.pow(sum / count, 2);
                // variance < 50 = blurry, 50-200 = okay, > 200 = sharp
                resolve(variance);
            };
            img.src = imageSrc;
        });
    };

    // ── Lighting Check ──
    const detectLighting = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;
                let totalBrightness = 0;
                let overexposed = 0;
                let underexposed = 0;
                const pixels = data.length / 4;
                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    totalBrightness += brightness;
                    if (brightness > 240) overexposed++;
                    if (brightness < 30) underexposed++;
                }
                const avgBrightness = totalBrightness / pixels;
                const overPct = (overexposed / pixels) * 100;
                const underPct = (underexposed / pixels) * 100;

                let status = 'good';
                let message = 'Good lighting';
                if (avgBrightness < 60 || underPct > 40) { status = 'low'; message = 'Low light – move to brighter area'; }
                else if (avgBrightness > 210 || overPct > 35) { status = 'overexposed'; message = 'Overexposed – reduce direct light'; }
                resolve({ status, message, avgBrightness: Math.round(avgBrightness) });
            };
            img.src = imageSrc;
        });
    };

    // ── Capture for active angle ──
    const captureAngle = useCallback(async () => {
        if (distanceStatus !== 'perfect') {
            alert("Adjust distance to 0.5m – 3.0m before capturing.");
            return;
        }
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        stampDateTime();

        // Run quality checks
        const [blurScore, lightResult] = await Promise.all([
            detectBlur(imageSrc),
            detectLighting(imageSrc)
        ]);

        const blurStatus = blurScore < 50 ? 'blurry' : blurScore < 200 ? 'acceptable' : 'sharp';

        setQualityScores(prev => ({
            ...prev,
            [activeAngle]: { blur: blurStatus, blurScore: Math.round(blurScore), lighting: lightResult }
        }));

        setMultiImages(prev => ({ ...prev, [activeAngle]: imageSrc }));
    }, [webcamRef, activeAngle, distanceStatus]);

    // ── Upload for active angle ──
    const handleUploadAngle = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const imageSrc = reader.result;
            stampDateTime();
            const [blurScore, lightResult] = await Promise.all([
                detectBlur(imageSrc),
                detectLighting(imageSrc)
            ]);
            const blurStatus = blurScore < 50 ? 'blurry' : blurScore < 200 ? 'acceptable' : 'sharp';
            setQualityScores(prev => ({
                ...prev,
                [activeAngle]: { blur: blurStatus, blurScore: Math.round(blurScore), lighting: lightResult }
            }));
            setMultiImages(prev => ({ ...prev, [activeAngle]: imageSrc }));
        };
        reader.readAsDataURL(file);
    };

    // Retake active angle
    const handleRetakeAngle = (slot) => {
        setMultiImages(prev => ({ ...prev, [slot]: null }));
        setQualityScores(prev => ({ ...prev, [slot]: null }));
        setActiveAngle(slot);
    };

    // Check if minimum required angles are captured
    const requiredCaptured = angleSlots.filter(s => s.required).every(s => multiImages[s.key]);
    const totalCaptured = Object.values(multiImages).filter(Boolean).length;

    // Reset everything
    const handleRetake = () => {
        setMultiImages({ front: null, side: null, leafCloseup: null, fruitFlower: null });
        setQualityScores({ front: null, side: null, leafCloseup: null, fruitFlower: null });
        setActiveAngle('front');
        setResult(null);
        setStep('capture');
    };

    const toggleSymptom = (symptom) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], { type: mime });
    };

    const handlePiP = async () => {
        if (webcamRef.current && webcamRef.current.video) {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                    setIsPiPActive(false);
                } else {
                    await webcamRef.current.video.requestPictureInPicture();
                    setIsPiPActive(true);
                }
            } catch (error) { console.error("PiP failed:", error); }
        }
    };

    // ── AI Analysis ──
    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const primaryImage = multiImages.front || multiImages.side;
            const blob = dataURLtoBlob(primaryImage);
            const submissionData = new FormData();
            submissionData.append('file', blob, 'capture.jpg');
            submissionData.append('estimated_distance', distance);
            submissionData.append('device_info', metadata.deviceInfo);
            submissionData.append('gps_location', metadata.gpsLocation);
            submissionData.append('plant_name', formData.plantName);
            submissionData.append('plant_type', formData.plantType);
            submissionData.append('growth_stage', formData.growthStage);
            submissionData.append('location_type', formData.locationType);
            submissionData.append('symptoms', formData.symptoms.join(', '));
            submissionData.append('sunlight', formData.sunlight);
            submissionData.append('watering', formData.watering);
            submissionData.append('soil_type', formData.soilType);
            submissionData.append('temperature', formData.temperature);
            submissionData.append('humidity', formData.humidity);
            submissionData.append('treatment_medicine', formData.treatmentMedicine);
            submissionData.append('treatment_dosage', formData.treatmentDosage);
            submissionData.append('treatment_method', formData.treatmentMethod);
            submissionData.append('treatment_phase', treatmentPhase);
            submissionData.append('reference_object_confirmed', formData.referenceObjectConfirmed ? 1 : 0);
            submissionData.append('multi_angle_count', totalCaptured);

            const response = await analyzeImage(submissionData);
            const data = response.data;

            setResult({
                status: data.disease === 'Healthy' ? 'Healthy' : 'Affected',
                confidence: (data.confidence * 100).toFixed(1),
                disease: data.disease,
                height: data.height,
                health_score: data.health_score,
                recommendations: data.disease === 'Healthy'
                    ? `Plant looks optimal at ${formData.growthStage} stage.`
                    : `Treat with ${formData.treatmentMedicine || 'recommended fungicide/pesticide'}.`
            });
            setStep('results');
        } catch (error) {
            console.error("Analysis failed:", error);
            const errorMsg = error.response?.data?.detail
                ? `Analysis failed: ${error.response.data.detail}`
                : "Analysis failed. Check your network connection.";
            alert(errorMsg);
        } finally { setLoading(false); }
    };

    // ── Save Record ──
    const handleSaveRecord = () => {
        if (!result) return;
        const plantData = {
            id: Date.now(),
            name: formData.plantName || 'Unknown Plant',
            species: formData.plantType,
            status: result.status,
            height: result.height,
            health_score: result.health_score,
            disease: result.disease,
            image: multiImages.front || multiImages.side,
            images: multiImages,
            location: metadata.gpsLocation,
            gpsCoords: metadata.gpsCoords,
            timestamp: new Date().toLocaleString(),
            treatmentPhase,
            notes: formData.notes,
            environment: {
                temperature: formData.temperature,
                humidity: formData.humidity,
                sunlight: formData.sunlight,
                soilType: formData.soilType
            }
        };
        addPlant(plantData);
        alert('Record saved successfully!');
        navigate('/records');
    };

    const getInstructionText = () => {
        if (distanceStatus === 'too-close') return "Move farther away (Min 0.5m)";
        if (distanceStatus === 'too-far') return "Move closer (Max 3m)";
        return "Perfect distance – Capture Now";
    };

    const getQualityBadge = (quality) => {
        if (!quality) return null;
        const blurColor = quality.blur === 'sharp' ? '#10b981' : quality.blur === 'acceptable' ? '#f59e0b' : '#ef4444';
        const lightColor = quality.lighting.status === 'good' ? '#10b981' : '#f59e0b';
        return { blurColor, lightColor, blurLabel: quality.blur, lightLabel: quality.lighting.message };
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-title">
                    <h2>HomeoAgri Image Capture</h2>
                    <p>Controlled plant monitoring for accurate AI diagnostics.</p>
                </div>
                {step === 'details' && (
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)' }}>Provide context for the AI</span>
                    </div>
                )}
            </header>

            <div className="capture-grid">
                {/* ════════════════════════════════════════════════════ */}
                {/* LEFT: VISUAL SECTION                               */}
                {/* ════════════════════════════════════════════════════ */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {step === 'capture' ? (
                        <>
                            {/* Webcam Live Feed */}
                            <div className="capture-container">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="webcam-view"
                                    style={{ filter: isLowLight ? 'contrast(1.5) brightness(1.2) sepia(0.3) hue-rotate(90deg)' : 'none' }}
                                    videoConstraints={{ facingMode: "environment" }}
                                />

                                {/* Utility Buttons */}
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 30 }}>
                                    <button onClick={() => setIsLowLight(!isLowLight)} className="btn" style={{ background: isLowLight ? 'var(--primary)' : 'rgba(0,0,0,0.5)', color: 'white', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }} title="Night Vision">
                                        {isLowLight ? <Sun size={18} /> : <Moon size={18} />}
                                    </button>
                                    <button onClick={handlePiP} className="btn" style={{ background: isPiPActive ? 'var(--primary)' : 'rgba(0,0,0,0.5)', color: 'white', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }} title="PiP">
                                        <RefreshCw size={18} />
                                    </button>
                                </div>

                                {/* Active Angle Badge */}
                                <div style={{
                                    position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 35,
                                    background: 'rgba(16,185,129,0.9)', color: 'white', padding: '0.4rem 1rem',
                                    borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <Camera size={14} />
                                    Capturing: {angleSlots.find(s => s.key === activeAngle)?.label}
                                </div>

                                {/* Framing Overlay */}
                                <div className="framing-overlay">
                                    <div className={`frame-guide ${distanceStatus}`}></div>
                                    <div className={`instruction-toast ${distanceStatus === 'perfect' ? 'perfect' : ''}`} style={{ top: 'auto', bottom: '7rem' }}>
                                        {distanceStatus === 'perfect' ? <CheckCircle2 size={18} /> : (distanceStatus === 'too-close' ? <AlertTriangle size={18} /> : <Info size={18} />)}
                                        {getInstructionText()}
                                    </div>
                                    <div className="distance-badge">{distance.toFixed(1)}m</div>
                                </div>

                                {/* Controls */}
                                <div className="controls-overlay">
                                    <div className="capture-buttons-row">
                                        <div className="mock-distance-control">
                                            <label>Distance Sim</label>
                                            <input type="range" min="0.2" max="5.0" step="0.1" style={{ width: '100%', height: '4px', accentColor: 'var(--primary)' }} value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} />
                                        </div>

                                        <button
                                            onClick={captureAngle}
                                            disabled={distanceStatus !== 'perfect'}
                                            className={`btn ${distanceStatus === 'perfect' ? 'btn-primary' : 'btn-secondary'}`}
                                            style={{
                                                padding: '0.8rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 800,
                                                boxShadow: distanceStatus === 'perfect' ? '0 10px 15px -3px rgba(16,185,129,0.4)' : 'none',
                                                opacity: distanceStatus === 'perfect' ? 1 : 0.6,
                                                cursor: distanceStatus === 'perfect' ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            <Camera size={22} /> CAPTURE
                                        </button>

                                        <label className="btn" style={{ background: 'rgba(255,255,255,0.95)', cursor: 'pointer', color: '#000', borderRadius: '50px', padding: '0.7rem 1.5rem', fontWeight: 700 }}>
                                            <Upload size={18} /> IMPORT
                                            <input type="file" hidden onChange={handleUploadAngle} accept="image/*" />
                                        </label>
                                    </div>

                                    {distanceStatus !== 'perfect' && (
                                        <div style={{
                                            background: 'rgba(239,68,68,0.2)', padding: '0.5rem 1.2rem', borderRadius: '50px',
                                            fontSize: '0.75rem', color: '#fecaca', border: '1px solid rgba(239,68,68,0.3)',
                                            fontWeight: 600, backdropFilter: 'blur(4px)'
                                        }}>
                                            <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                            SAFETY LOCK: Adjust distance (0.5m – 3.0m) to enable capture
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Multi-Angle Slots ── */}
                            <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layers size={16} /> Multi-Angle Capture ({totalCaptured}/{angleSlots.length})
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {angleSlots.map((slot) => {
                                        const quality = getQualityBadge(qualityScores[slot.key]);
                                        return (
                                            <div
                                                key={slot.key}
                                                onClick={() => { if (!multiImages[slot.key]) setActiveAngle(slot.key); }}
                                                style={{
                                                    position: 'relative', borderRadius: '12px', overflow: 'hidden',
                                                    border: activeAngle === slot.key ? '2px solid var(--primary)' : '1.5px solid #e2e8f0',
                                                    background: multiImages[slot.key] ? '#000' : 'white',
                                                    cursor: multiImages[slot.key] ? 'default' : 'pointer',
                                                    aspectRatio: '4/3', transition: 'all 0.2s'
                                                }}
                                            >
                                                {multiImages[slot.key] ? (
                                                    <>
                                                        <img src={multiImages[slot.key]} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        {/* Quality Indicators */}
                                                        {quality && (
                                                            <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '3px', zIndex: 3 }}>
                                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: quality.blurColor, border: '1px solid white' }} title={`Sharpness: ${quality.blurLabel}`} />
                                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: quality.lightColor, border: '1px solid white' }} title={quality.lightLabel} />
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRetakeAngle(slot.key); }}
                                                            style={{
                                                                position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(255,255,255,0.9)',
                                                                border: 'none', borderRadius: '6px', padding: '2px 6px', fontSize: '0.6rem',
                                                                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', color: '#dc2626'
                                                            }}
                                                        >
                                                            <RefreshCw size={10} /> Retake
                                                        </button>
                                                        <div style={{
                                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                                            color: 'white', padding: '0.25rem', textAlign: 'center',
                                                            fontSize: '0.6rem', fontWeight: 700
                                                        }}>
                                                            {slot.label}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.25rem', padding: '0.5rem' }}>
                                                        <slot.icon size={18} color={activeAngle === slot.key ? 'var(--primary)' : '#94a3b8'} />
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: activeAngle === slot.key ? 'var(--primary)' : '#94a3b8', textAlign: 'center' }}>
                                                            {slot.label}
                                                        </span>
                                                        {slot.required && <span style={{ fontSize: '0.5rem', color: '#ef4444', fontWeight: 600 }}>Required</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Quality Alerts */}
                                {qualityScores[activeAngle] && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {qualityScores[activeAngle].blur === 'blurry' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fef2f2', color: '#dc2626', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #fecaca' }}>
                                                <AlertCircle size={14} /> Image is blurry – please retake
                                            </div>
                                        )}
                                        {qualityScores[activeAngle].blur === 'acceptable' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fffbeb', color: '#92400e', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #fef3c7' }}>
                                                <AlertTriangle size={14} /> Moderate sharpness – consider retake
                                            </div>
                                        )}
                                        {qualityScores[activeAngle].blur === 'sharp' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5', color: '#059669', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #d1fae5' }}>
                                                <CheckCircle2 size={14} /> Sharp image ✓
                                            </div>
                                        )}
                                        {qualityScores[activeAngle].lighting.status !== 'good' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fffbeb', color: '#92400e', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #fef3c7' }}>
                                                <Sun size={14} /> {qualityScores[activeAngle].lighting.message}
                                            </div>
                                        )}
                                        {qualityScores[activeAngle].lighting.status === 'good' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5', color: '#059669', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #d1fae5' }}>
                                                <Sun size={14} /> Good lighting ✓
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Proceed Button */}
                                {requiredCaptured && (
                                    <button
                                        onClick={() => setStep('details')}
                                        className="btn btn-primary"
                                        style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        Proceed to Details <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        /* ── Preview of Captured Images ── */
                        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <img src={multiImages.front || multiImages.side} alt="Primary" style={{ width: '100%', flex: 1, objectFit: 'cover' }} />

                            {/* Metadata Overlay */}
                            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20 }}>
                                <div className="meta-info-card" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="meta-info-item" style={{ color: 'white' }}><MapPin size={14} /> {metadata.gpsLocation}</div>
                                    <div className="meta-info-item" style={{ color: 'white' }}><Clock size={14} /> {metadata.captureDate} | {metadata.captureTime}</div>
                                    <div className="meta-info-item" style={{ color: 'white' }}><Ruler size={14} /> {distance.toFixed(1)}m distance</div>
                                    <div className="meta-info-item" style={{ color: 'white' }}><Layers size={14} /> {totalCaptured} angles captured</div>
                                    {treatmentPhase !== 'none' && (
                                        <div className="meta-info-item" style={{ color: '#fbbf24' }}><Pill size={14} /> Phase: {treatmentPhase}</div>
                                    )}
                                </div>
                            </div>

                            {/* Angle Thumbnails */}
                            <div style={{ position: 'absolute', bottom: '4.5rem', left: '1.5rem', display: 'flex', gap: '0.5rem', zIndex: 20 }}>
                                {angleSlots.filter(s => multiImages[s.key]).map(slot => (
                                    <div key={slot.key} style={{ width: 50, height: 50, borderRadius: '8px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                        <img src={multiImages[slot.key]} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ position: 'absolute', bottom: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '1rem', zIndex: 25 }}>
                                <button onClick={handleRetake} className="btn" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--danger)', fontWeight: 700 }}>
                                    <RefreshCw size={18} /> Retake All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════ */}
                {/* RIGHT: FORM / RESULTS SECTION                      */}
                {/* ════════════════════════════════════════════════════ */}
                <div className="card">
                    {step === 'details' ? (
                        <div className="form-section">
                            <h3 style={{ marginTop: 0 }}>Contextual Information</h3>

                            {/* Plant Info */}
                            <div className="form-group">
                                <label>Plant Identity</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="form-input" placeholder="Plant Name (e.g. Tomato)" value={formData.plantName} onChange={(e) => setFormData({ ...formData, plantName: e.target.value })} />
                                    <select className="form-input" value={formData.plantType} onChange={(e) => setFormData({ ...formData, plantType: e.target.value })}>
                                        <option>Medicinal</option>
                                        <option>Cereal</option>
                                        <option>Vegetable</option>
                                        <option>Fruit</option>
                                    </select>
                                </div>
                            </div>



                            {/* Symptoms */}
                            <div className="form-group">
                                <label>Symptoms Observed</label>
                                <div className="symptoms-grid">
                                    {['Yellow leaves', 'Brown spots', 'Wilting', 'Slow growth', 'Other'].map(s => (
                                        <div key={s} className={`symptom-item ${formData.symptoms.includes(s) ? 'selected' : ''}`} onClick={() => toggleSymptom(s)}>
                                            {formData.symptoms.includes(s) ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Environmental Data */}
                            <div className="form-group">
                                <label><ThermometerSun size={16} /> Environment</label>
                                <div>
                                    <select className="form-input" value={formData.watering} onChange={(e) => setFormData({ ...formData, watering: e.target.value })}>
                                        <option>Daily</option>
                                        <option>Twice Weekly</option>
                                        <option>Weekly</option>
                                    </select>
                                </div>
                            </div>

                            {/* ── Treatment Phase Tag ── */}
                            <div className="form-group">
                                <label><Pill size={16} /> Treatment Phase Tag</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { val: 'none', label: 'No Treatment', color: '#64748b', bg: '#f1f5f9' },
                                        { val: 'before', label: 'Before', color: '#dc2626', bg: '#fef2f2' },
                                        { val: 'during', label: 'During', color: '#f59e0b', bg: '#fffbeb' },
                                        { val: 'after', label: 'After', color: '#059669', bg: '#ecfdf5' }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setTreatmentPhase(opt.val)}
                                            style={{
                                                padding: '0.6rem 0.5rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem',
                                                border: treatmentPhase === opt.val ? `2px solid ${opt.color}` : '1.5px solid #e2e8f0',
                                                background: treatmentPhase === opt.val ? opt.bg : 'white',
                                                color: treatmentPhase === opt.val ? opt.color : '#94a3b8',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                                            }}
                                        >
                                            {treatmentPhase === opt.val && <CheckCircle2 size={14} />}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Medicine Tracking */}
                            <div className="form-group">
                                <label>Medicine / Treatment Details</label>
                                <input className="form-input" placeholder="Medicine/Fertilizer Name" style={{ marginBottom: '0.5rem' }} value={formData.treatmentMedicine} onChange={(e) => setFormData({ ...formData, treatmentMedicine: e.target.value })} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <input className="form-input" placeholder="Dosage (e.g. 5ml)" value={formData.treatmentDosage} onChange={(e) => setFormData({ ...formData, treatmentDosage: e.target.value })} />
                                    <select className="form-input" value={formData.treatmentMethod} onChange={(e) => setFormData({ ...formData, treatmentMethod: e.target.value })}>
                                        <option>Spray</option>
                                        <option>Soil</option>
                                        <option>Water Mix</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem' }}>Medicine Applied Date</label>
                                        <input type="date" className="form-input" value={formData.treatmentStartDate} onChange={(e) => setFormData({ ...formData, treatmentStartDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem' }}>Dosage Stop Date</label>
                                        <input type="date" className="form-input" value={formData.treatmentStopDate} onChange={(e) => setFormData({ ...formData, treatmentStopDate: e.target.value })} />
                                    </div>
                                </div>
                                <textarea className="form-input" placeholder="Notes (conditions, observations...)" style={{ marginTop: '0.5rem', minHeight: '60px' }} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            {/* Reference Object */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" checked={formData.referenceObjectConfirmed} onChange={(e) => setFormData({ ...formData, referenceObjectConfirmed: e.target.checked })} />
                                    <Ruler size={16} /> Ruler/Reference Object present in image?
                                </label>
                                <p style={{ margin: '0.25rem 0 0 1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Place a ruler or coin near the plant for accurate height & size measurement
                                </p>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : <>Start AI Analysis <ArrowRight size={20} /></>}
                            </button>
                        </div>
                    ) : result ? (
                        /* ── Results Section ── */
                        <div className="results-content">
                            <h3 style={{ marginTop: 0 }}>Analysis Complete</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: result.status === 'Healthy' ? '#ecfdf5' : '#fef2f2', padding: '1rem', borderRadius: '12px' }}>
                                <span style={{ fontWeight: 600 }}>Health Status</span>
                                <span style={{ fontWeight: 700, color: result.status === 'Healthy' ? 'var(--primary)' : 'var(--danger)' }}>
                                    {result.status} ({result.confidence}%)
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Detected</div>
                                    <div style={{ fontWeight: 700 }}>{result.disease}</div>
                                </div>
                                <div className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Estimated Height</div>
                                    <div style={{ fontWeight: 700 }}>{result.height?.toFixed(1)} cm</div>
                                </div>
                            </div>

                            {/* Treatment Phase Badge */}
                            {treatmentPhase !== 'none' && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem',
                                    padding: '0.75rem 1rem', borderRadius: '12px',
                                    background: treatmentPhase === 'before' ? '#fef2f2' : treatmentPhase === 'during' ? '#fffbeb' : '#ecfdf5',
                                    color: treatmentPhase === 'before' ? '#dc2626' : treatmentPhase === 'during' ? '#b45309' : '#059669',
                                    fontWeight: 700, fontSize: '0.85rem'
                                }}>
                                    <Pill size={18} />
                                    Tagged as: {treatmentPhase.charAt(0).toUpperCase() + treatmentPhase.slice(1)} Treatment
                                    {formData.treatmentMedicine && ` • ${formData.treatmentMedicine}`}
                                </div>
                            )}

                            {/* Multi-Angle Thumbnails */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Captured Angles ({totalCaptured})</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {angleSlots.filter(s => multiImages[s.key]).map(slot => (
                                        <div key={slot.key} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                                            <img src={multiImages[slot.key]} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                                color: 'white', textAlign: 'center', padding: '0.25rem',
                                                fontSize: '0.55rem', fontWeight: 700
                                            }}>{slot.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Info size={18} /> AI Recommendation
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{result.recommendations}</p>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveRecord}
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: '1rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Save size={20} /> Save to Records
                            </button>

                            {/* Expert Actions */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Expert Actions</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <button className="btn" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: 'var(--text-dark)' }} onClick={() => window.print()}>
                                        <Upload size={18} /> Download PDF
                                    </button>
                                    <button className="btn btn-primary" onClick={() => alert("Connecting to Agronomist...")}>
                                        Consult Expert
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fef3c7' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '0.9rem' }}>Trend Analysis</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, height: '6px', background: '#fde68a', borderRadius: '3px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '0', width: `${result.health_score}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e' }}>{result.health_score}% Health</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '0.5rem 0 0 0' }}>*Based on color consistency and leaf density.</p>
                            </div>

                            <button onClick={handleRetake} className="btn" style={{ width: '100%', background: '#e2e8f0', color: 'var(--text-dark)' }}>
                                <RefreshCw size={18} /> New Capture
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', opacity: 0.6 }}>
                            <Camera size={48} style={{ marginBottom: '1rem' }} />
                            <p>Capture images to begin context collection</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaptureImage;
