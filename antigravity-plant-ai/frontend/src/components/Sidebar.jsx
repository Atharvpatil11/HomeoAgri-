import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Camera, BookOpen, Activity, Database, Settings, LogOut, LogIn, Beaker } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const links = [
        { path: '/', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/capture', name: 'Image Capture', icon: Camera },
        { path: '/medicine-analysis', name: 'Medicine Analysis', icon: Beaker },

        { path: '/growth', name: 'Specimen History', icon: Activity },
        { path: '/records', name: 'Data Records', icon: Database },
        { path: '/settings', name: 'Automation', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`} style={{ borderRight: '1px solid #e2e8f0', background: 'var(--surface)' }}>
            <div className="sidebar-links">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            background: isActive ? 'var(--primary-light, #ecfdf5)' : 'transparent',
                            color: isActive ? 'var(--primary-dark)' : 'var(--text-light)',
                            borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent'
                        })}
                    >
                        <link.icon size={22} />
                        <span className="link-text" style={{ fontWeight: 500 }}>{link.name}</span>
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
