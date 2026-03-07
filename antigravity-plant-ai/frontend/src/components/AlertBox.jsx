import React from 'react';
import { AlertCircle, X, CheckCircle, Info } from 'lucide-react';
import './AlertBox.css';

const AlertBox = ({ type = 'info', message, onClose }) => {
    const icons = {
        info: <Info size={20} />,
        success: <CheckCircle size={20} />,
        warning: <AlertCircle size={20} />,
        error: <AlertCircle size={20} />,
        danger: <AlertCircle size={20} />
    };

    return (
        <div className={`alert alert-${type}`}>
            <div className="alert-content">
                {icons[type]}
                <span>{message}</span>
            </div>
            {onClose && (
                <button onClick={onClose} className="close-btn">
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default AlertBox;
