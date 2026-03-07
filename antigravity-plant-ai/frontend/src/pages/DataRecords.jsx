import React, { useState, useMemo } from 'react';
import {
    Download, Filter, Search, X, Eye, Sprout, Pill,
    Camera, Clock, MapPin, Layers, ThermometerSun, Droplets,
    CheckCircle2, AlertTriangle, Beaker, Calendar, Trash2, FileText
} from 'lucide-react';
import { usePlantContext } from '../context/PlantContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DataRecords = () => {
    const { plants, treatments, removePlant, removeTreatment } = usePlantContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all, scan, treatment
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Helper to safely format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return new Intl.DateTimeFormat('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const formatShortDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return new Intl.DateTimeFormat('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    // Combine all records into unified timeline
    const allRecords = useMemo(() => {
        const scanRecords = plants.map(p => ({
            id: `scan-${p.id}`,
            type: 'Scan',
            plantName: p.name || 'Unknown Plant',
            species: p.species || '',
            date: p.savedAt || p.timestamp || new Date().toISOString(),
            details: [
                p.height ? `Height: ${typeof p.height === 'number' ? p.height.toFixed(1) : p.height}cm` : null,
                p.health_score ? `Health: ${p.health_score}%` : null,
                p.disease && p.disease !== 'Healthy' ? `Disease: ${p.disease}` : null
            ].filter(Boolean).join(' | ') || 'Basic scan record',
            status: p.status || 'Recorded',
            image: p.image || p.image_url || null,
            location: p.location || p.gpsLocation || null,
            treatmentPhase: p.treatmentPhase || null,
            environment: p.environment || null,
            multiImages: p.images || null,
            healthScore: p.health_score,
            height: p.height,
            disease: p.disease,
            notes: p.notes
        }));

        const treatmentRecords = treatments.map(t => ({
            id: `treatment-${t.id}`,
            type: 'Treatment',
            plantName: t.plantName || 'Unknown Plant',
            species: '',
            date: t.savedAt || t.timestamp || t.startDate || new Date().toISOString(),
            details: [
                t.name ? `Medicine: ${t.name}` : null,
                t.dosage ? `(${t.dosage})` : null,
                t.method ? `via ${t.method}` : null,
                t.effectiveness ? `Effectiveness: ${t.effectiveness}%` : null
            ].filter(Boolean).join(' ') || 'Treatment record',
            status: t.status || 'Recorded',
            image: t.images?.before || t.images?.after || null,
            treatmentImages: t.images || null,
            medicineName: t.name,
            dosage: t.dosage,
            method: t.method,
            type_tag: t.type,
            startDate: t.startDate,
            stopDate: t.stopDate,
            effectiveness: t.effectiveness,
            notes: t.notes
        }));

        return [...scanRecords, ...treatmentRecords].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            return dateB - dateA;
        });
    }, [plants, treatments]);

    // Filter records
    const filteredRecords = useMemo(() => {
        return allRecords.filter(record => {
            const matchesSearch = !searchTerm ||
                (record.plantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.details || '').toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDate = true;
            if (dateFilter) {
                try {
                    const recordDate = new Date(record.date);
                    const filterDate = new Date(dateFilter);
                    matchesDate = recordDate.toDateString() === filterDate.toDateString();
                } catch { matchesDate = false; }
            }

            const matchesType = typeFilter === 'all' ||
                (typeFilter === 'scan' && record.type === 'Scan') ||
                (typeFilter === 'treatment' && record.type === 'Treatment');

            return matchesSearch && matchesDate && matchesType;
        });
    }, [allRecords, searchTerm, dateFilter, typeFilter]);

    // Stats
    const totalScans = allRecords.filter(r => r.type === 'Scan').length;
    const totalTreatments = allRecords.filter(r => r.type === 'Treatment').length;

    const handleExportCSV = () => {
        const headers = ["Type,Plant Name,Date,Details,Status"];
        const csvContent = filteredRecords.map(r =>
            `"${r.type}","${r.plantName}","${formatDate(r.date)}","${r.details}","${r.status}"`
        );
        const csv = [headers, ...csvContent].join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homeoagri_records_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129); // var(--primary)
        doc.text("HomeoAgri - Data Records", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // var(--text-light)
        doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);
        doc.text(`Total Records: ${filteredRecords.length}`, 14, 35);

        // Define Table Headers
        const tableColumn = ["Type", "Plant/Record", "Date & Time", "Details", "Status"];
        const tableRows = [];

        filteredRecords.forEach(record => {
            const rowData = [
                record.type,
                record.plantName,
                formatDate(record.date),
                record.details,
                record.status
            ];
            tableRows.push(rowData);
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // Primary color
            alternateRowStyles: { fillColor: [248, 250, 252] }, // background
            styles: { fontSize: 8, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 35 },
                2: { cellWidth: 40 },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 25 }
            }
        });

        doc.save(`homeoagri_records_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-title">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={24} color="var(--primary)" /> Data Records
                    </h2>
                    <p>All scan and treatment data — updated in real-time</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn" onClick={handleExportPDF} style={{
                        background: 'var(--primary-gradient)', color: 'white',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none'
                    }}>
                        <FileText size={18} /> Export PDF
                    </button>
                    <button className="btn hide-mobile" onClick={handleExportCSV} style={{
                        background: 'var(--surface)', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <Download size={18} /> CSV
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#ecfdf5', padding: '0.6rem', borderRadius: '10px' }}>
                        <Layers size={20} color="#059669" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{allRecords.length}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Records</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f0fdf4', padding: '0.6rem', borderRadius: '10px' }}>
                        <Camera size={20} color="#16a34a" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{totalScans}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Image Scans</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f0f9ff', padding: '0.6rem', borderRadius: '10px' }}>
                        <Beaker size={20} color="#0369a1" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>{totalTreatments}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Treatments</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Filters */}
                <div style={{
                    padding: '1rem', borderBottom: '1px solid #f1f5f9',
                    display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search plant name, medicine, details..."
                            style={{
                                width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem',
                                borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem',
                                outline: 'none', transition: 'border-color 0.2s'
                            }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                    <input
                        type="date"
                        style={{
                            padding: '0.6rem', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                            fontSize: '0.85rem', outline: 'none', width: '160px'
                        }}
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                        {['all', 'scan', 'treatment'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                style={{
                                    padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none',
                                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                    background: typeFilter === t ? 'white' : 'transparent',
                                    color: typeFilter === t ? 'var(--primary-dark)' : '#94a3b8',
                                    boxShadow: typeFilter === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t === 'all' ? 'All' : t === 'scan' ? 'Scans' : 'Treatments'}
                            </button>
                        ))}
                    </div>
                    {(searchTerm || dateFilter || typeFilter !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setDateFilter(''); setTypeFilter('all'); }}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#ef4444', fontSize: '0.8rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}
                        >
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>

                {/* Results count */}
                <div style={{ padding: '0.5rem 1rem', background: '#fafbfc', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Showing {filteredRecords.length} of {allRecords.length} records
                </div>

                <div className="table-responsive">
                    <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Type</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Plant / Record</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Date & Time</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Details</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Status</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Image</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record, idx) => (
                                    <tr key={record.id} style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        background: idx % 2 === 0 ? 'white' : '#fafbfc',
                                        transition: 'background 0.15s'
                                    }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                                        onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafbfc'}
                                    >
                                        {/* Type Badge */}
                                        <td data-label="Type" style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                background: record.type === 'Scan' ? '#ecfdf5' : '#ede9fe',
                                                color: record.type === 'Scan' ? '#059669' : '#6d28d9'
                                            }}>
                                                {record.type === 'Scan' ? <Camera size={13} /> : <Beaker size={13} />}
                                                {record.type}
                                            </div>
                                            {record.treatmentPhase && record.treatmentPhase !== 'none' && (
                                                <div style={{
                                                    marginTop: '4px', fontSize: '0.65rem', fontWeight: 600,
                                                    padding: '2px 6px', borderRadius: '6px', display: 'inline-block',
                                                    background: record.treatmentPhase === 'before' ? '#fef2f2' : record.treatmentPhase === 'during' ? '#fffbeb' : '#ecfdf5',
                                                    color: record.treatmentPhase === 'before' ? '#dc2626' : record.treatmentPhase === 'during' ? '#b45309' : '#059669'
                                                }}>
                                                    {record.treatmentPhase.toUpperCase()}
                                                </div>
                                            )}
                                        </td>

                                        {/* Plant Name */}
                                        <td data-label="Plant" style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{record.plantName}</div>
                                            {record.species && <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>{record.species}</div>}
                                            {record.location && (
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                                    <MapPin size={10} /> {record.location}
                                                </div>
                                            )}
                                        </td>

                                        {/* Date & Time */}
                                        <td data-label="Date" style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.82rem' }}>
                                                <Clock size={14} color="#94a3b8" />
                                                {formatDate(record.date)}
                                            </div>
                                        </td>

                                        {/* Details */}
                                        <td data-label="Details" style={{ padding: '0.85rem 1rem', maxWidth: '250px' }}>
                                            <div style={{ fontSize: '0.82rem', color: '#334155' }}>{record.details}</div>
                                        </td>

                                        {/* Status */}
                                        <td data-label="Status" style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                background: record.status === 'Healthy' || record.status === 'Completed' ? '#ecfdf5' :
                                                    record.status === 'Affected' || record.status === 'Critical' ? '#fef2f2' : '#fffbeb',
                                                color: record.status === 'Healthy' || record.status === 'Completed' ? '#059669' :
                                                    record.status === 'Affected' || record.status === 'Critical' ? '#dc2626' : '#b45309'
                                            }}>
                                                {record.status}
                                            </span>
                                        </td>

                                        {/* Image */}
                                        <td data-label="Image" style={{ padding: '0.85rem 1rem' }}>
                                            {record.image ? (
                                                <div
                                                    onClick={() => setSelectedImage(record.image)}
                                                    style={{
                                                        width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden',
                                                        cursor: 'pointer', border: '2px solid #e2e8f0', position: 'relative',
                                                        transition: 'border-color 0.2s', margin: '0 0 0 auto'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                >
                                                    <img src={record.image} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <div style={{
                                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Eye size={14} color="white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 500 }}>—</span>
                                            )}
                                        </td>

                                        {/* Action */}
                                        <td data-label="Action" style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setSelectedRecord(record)}
                                                    style={{
                                                        background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px',
                                                        padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem',
                                                        fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                                                >
                                                    <Eye size={13} /> View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this record?')) {
                                                            if (record.type === 'Scan') {
                                                                removePlant(record.id.replace('scan-', ''));
                                                            } else if (record.type === 'Treatment') {
                                                                removeTreatment(record.id.replace('treatment-', ''));
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                                                        padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem',
                                                        fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <Layers size={36} color="#cbd5e1" />
                                            <p style={{ fontWeight: 600, margin: 0 }}>No records found</p>
                                            <p style={{ fontSize: '0.8rem', margin: 0 }}>Capture images or run medicine analysis to see data here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Total: {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
                    <span>Last updated: {formatDate(new Date().toISOString())}</span>
                </div>
            </div>

            {/* ═══ Detail Modal ═══ */}
            {selectedRecord && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setSelectedRecord(null)}>
                    <div
                        style={{
                            background: 'white', borderRadius: '20px', padding: '1.5rem',
                            maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                                        background: selectedRecord.type === 'Scan' ? '#ecfdf5' : '#ede9fe',
                                        color: selectedRecord.type === 'Scan' ? '#059669' : '#6d28d9'
                                    }}>
                                        {selectedRecord.type === 'Scan' ? <Camera size={12} /> : <Beaker size={12} />}
                                        {selectedRecord.type}
                                    </div>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                                        background: selectedRecord.status === 'Healthy' || selectedRecord.status === 'Completed' ? '#ecfdf5' : '#fffbeb',
                                        color: selectedRecord.status === 'Healthy' || selectedRecord.status === 'Completed' ? '#059669' : '#b45309'
                                    }}>
                                        {selectedRecord.status}
                                    </span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedRecord.plantName}</h3>
                                {selectedRecord.species && <p style={{ margin: '0.15rem 0 0', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>{selectedRecord.species}</p>}
                            </div>
                            <button onClick={() => setSelectedRecord(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        {/* Image */}
                        {selectedRecord.image && (
                            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', aspectRatio: '16/9' }}>
                                <img src={selectedRecord.image} alt="Record" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}

                        {/* Multi-angle images */}
                        {selectedRecord.multiImages && Object.values(selectedRecord.multiImages).some(Boolean) && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Captured Angles</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {Object.entries(selectedRecord.multiImages).filter(([, v]) => v).map(([key, src]) => (
                                        <div key={key} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', cursor: 'pointer' }}
                                            onClick={() => setSelectedImage(src)}>
                                            <img src={src} alt={key} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                                color: 'white', textAlign: 'center', padding: '0.2rem',
                                                fontSize: '0.55rem', fontWeight: 700, textTransform: 'capitalize'
                                            }}>{key}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> Recorded At
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                                    {formatDate(selectedRecord.date)}
                                </div>
                            </div>
                            {selectedRecord.location && (
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> Location
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                                        {selectedRecord.location}
                                    </div>
                                </div>
                            )}
                            {selectedRecord.healthScore && (
                                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem' }}>Health Score</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{selectedRecord.healthScore}%</div>
                                </div>
                            )}
                            {selectedRecord.height && (
                                <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem' }}>Height</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1' }}>{typeof selectedRecord.height === 'number' ? selectedRecord.height.toFixed(1) : selectedRecord.height} cm</div>
                                </div>
                            )}
                            {selectedRecord.effectiveness && (
                                <div style={{ background: '#ede9fe', borderRadius: '10px', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem' }}>Effectiveness</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6d28d9' }}>{selectedRecord.effectiveness}%</div>
                                </div>
                            )}
                            {selectedRecord.disease && selectedRecord.disease !== 'Healthy' && (
                                <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem' }}>Disease Detected</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>{selectedRecord.disease}</div>
                                </div>
                            )}
                        </div>

                        {/* Environment */}
                        {selectedRecord.environment && (
                            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Environment Data</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {selectedRecord.environment.temperature && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}>
                                            <ThermometerSun size={14} color="#ef4444" /> {selectedRecord.environment.temperature}°C
                                        </span>
                                    )}
                                    {selectedRecord.environment.humidity && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}>
                                            <Droplets size={14} color="#0ea5e9" /> {selectedRecord.environment.humidity}%
                                        </span>
                                    )}
                                    {selectedRecord.environment.sunlight && (
                                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>☀ {selectedRecord.environment.sunlight}</span>
                                    )}
                                    {selectedRecord.environment.soilType && (
                                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>🌱 {selectedRecord.environment.soilType}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Treatment Phase */}
                        {selectedRecord.treatmentPhase && selectedRecord.treatmentPhase !== 'none' && (
                            <div style={{
                                padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem',
                                background: selectedRecord.treatmentPhase === 'before' ? '#fef2f2' : selectedRecord.treatmentPhase === 'during' ? '#fffbeb' : '#ecfdf5',
                                color: selectedRecord.treatmentPhase === 'before' ? '#dc2626' : selectedRecord.treatmentPhase === 'during' ? '#b45309' : '#059669',
                                fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                <Pill size={16} /> Treatment Phase: {selectedRecord.treatmentPhase.charAt(0).toUpperCase() + selectedRecord.treatmentPhase.slice(1)}
                            </div>
                        )}

                        {/* Medicine Details for Treatment records */}
                        {selectedRecord.type === 'Treatment' && (
                            <div style={{ background: '#faf5ff', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9', marginBottom: '0.5rem' }}>Medicine Details</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                                    {selectedRecord.medicineName && <div><span style={{ color: '#94a3b8' }}>Name:</span> <strong>{selectedRecord.medicineName}</strong></div>}
                                    {selectedRecord.dosage && <div><span style={{ color: '#94a3b8' }}>Dosage:</span> <strong>{selectedRecord.dosage}</strong></div>}
                                    {selectedRecord.method && <div><span style={{ color: '#94a3b8' }}>Method:</span> <strong>{selectedRecord.method}</strong></div>}
                                    {selectedRecord.type_tag && <div><span style={{ color: '#94a3b8' }}>Type:</span> <strong>{selectedRecord.type_tag}</strong></div>}
                                    {selectedRecord.startDate && <div><span style={{ color: '#94a3b8' }}>Start:</span> <strong>{formatShortDate(selectedRecord.startDate)}</strong></div>}
                                    {selectedRecord.stopDate && <div><span style={{ color: '#94a3b8' }}>Stop:</span> <strong>{formatShortDate(selectedRecord.stopDate)}</strong></div>}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {selectedRecord.notes && (
                            <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>Notes</div>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f' }}>{selectedRecord.notes}</p>
                            </div>
                        )}

                        <button onClick={() => setSelectedRecord(null)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ Image Viewer Modal ═══ */}
            {selectedImage && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
                }} onClick={() => setSelectedImage(null)}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={32} />
                        </button>
                        <img src={selectedImage} alt="Full View" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 20px 25px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataRecords;
