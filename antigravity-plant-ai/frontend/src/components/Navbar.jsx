import React from 'react';
import { Menu, Bell, User, Leaf, LogIn, ArrowLeft, LogOut, UserPlus, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlantContext } from '../context/PlantContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { activeAlerts, dismissAlert, plants, setSelectedPlant } = usePlantContext();
    const location = useLocation();
    const navigate = useNavigate();

    const isDashboard = location.pathname === '/';
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns on click outside
    React.useEffect(() => {
        const handleClickOutside = () => {
            setShowDropdown(false);
            setShowNotifications(false);
        };
        if (showDropdown || showNotifications) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showDropdown, showNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationClick = (alert) => {
        if (alert.plantId) {
            const plant = plants.find(p => p.id === alert.plantId);
            if (plant) {
                setSelectedPlant(plant);
                navigate('/growth');
            }
        }
        setShowNotifications(false);
    };

    return (
        <nav className="navbar" style={{ background: 'var(--surface)', borderBottom: '1px solid #e2e8f0', fontFamily: "'Inter', sans-serif" }}>
            <div className="navbar-left">
                <button className="icon-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div style={{ background: 'var(--primary-gradient)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <Leaf size={20} color="white" />
                        </div>
                        {!isMobile && (
                            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.02em' }}>
                                HomeoAgri
                            </h1>
                        )}
                    </Link>

                    {!isDashboard && isMobile && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{ background: '#f1f5f9', border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    )}
                </div>
            </div>
            <div className="navbar-right">
                {!isDashboard && !isMobile && (
                    <button
                        className="btn"
                        onClick={() => navigate(-1)}
                        style={{ background: '#f1f5f9', color: 'var(--text-dark)', padding: '0.5rem 1rem', marginRight: '1rem', fontWeight: 600 }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                )}
                {user ? (
                    <div className="profile-container" onClick={(e) => e.stopPropagation()}>
                        <div style={{ position: 'relative' }}>
                            <button
                                className="icon-btn"
                                style={{ marginRight: '0.5rem' }}
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowDropdown(false);
                                }}
                            >
                                <Bell size={20} />
                                {activeAlerts.length > 0 && (
                                    <span className="badge">{activeAlerts.length}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="profile-dropdown" style={{ minWidth: '320px', padding: '0', borderRadius: '16px' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem' }}>
                                        Notifications
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '12px' }}>{activeAlerts.length} New</span>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {activeAlerts.length === 0 ? (
                                            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                No new notifications
                                            </div>
                                        ) : (
                                            activeAlerts.map(alert => (
                                                <div
                                                    key={alert.id}
                                                    className="dropdown-item notification-item"
                                                    onClick={() => handleNotificationClick(alert)}
                                                    style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid #f8fafc', padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s' }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            color: alert.type === 'danger' ? 'var(--danger)' : alert.type === 'warning' ? '#f59e0b' : 'var(--primary)'
                                                        }}>
                                                            {alert.type}
                                                        </span>
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{alert.time}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '10px', color: 'var(--text-dark)', fontWeight: 500 }}>{alert.message}</div>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            Mark as read
                                                        </button>
                                                        {alert.plantId && (
                                                            <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>•</span>
                                                        )}
                                                        {alert.plantId && (
                                                            <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700 }}>View Details</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => { setShowNotifications(false); navigate('/records'); }}
                                        style={{ justifyContent: 'center', fontWeight: 700, color: 'white', background: 'var(--primary)', margin: '10px', borderRadius: '10px', padding: '12px', border: 'none' }}
                                    >
                                        View All Alerts
                                    </button>
                                </div>
                            )}
                        </div>

                        <div
                            className="profile"
                            onClick={() => {
                                setShowDropdown(!showDropdown);
                                setShowNotifications(false);
                            }}
                        >
                            <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <User size={20} />
                            </div>
                            {!isMobile && (
                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.full_name || 'User'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Online</span>
                                </div>
                            )}
                            <ChevronDown size={16} className={showDropdown ? 'rotate-180' : ''} style={{ transition: 'transform 0.2s' }} />
                        </div>

                        {showDropdown && (
                            <div className="profile-dropdown" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: '0', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '200px', overflow: 'hidden' }}>
                                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/profile'); }} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <User size={18} /> View Profile
                                </button>
                                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/register'); }} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <UserPlus size={18} /> Add Another User
                                </button>
                                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings'); }} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <Settings size={18} /> Settings
                                </button>
                                <button className="dropdown-item logout" onClick={handleLogout} style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--danger)', borderTop: '1px solid #eee' }}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <LogIn size={18} /> Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
