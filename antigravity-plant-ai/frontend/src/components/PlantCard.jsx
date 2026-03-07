import React from 'react';
import './PlantCard.css';
import { Droplets, Sun, Thermometer } from 'lucide-react';

const PlantCard = ({ plant, onClick }) => {
    return (
        <div className="card plant-card" onClick={() => onClick(plant)}>
            <div className="plant-image">
                <img src={plant.image || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80'} alt={plant.name} />
                <span className={`status-badge status-${plant.status.toLowerCase()}`}>
                    {plant.status}
                </span>
            </div>
            <div className="plant-info">
                <h3>{plant.name}</h3>
                <p className="species">{plant.species}</p>

                <div className="plant-stats">
                    <div className="stat">
                        <Droplets size={16} className="text-blue-500" />
                        <span>{plant.moisture}%</span>
                    </div>
                    <div className="stat">
                        <Sun size={16} className="text-yellow-500" />
                        <span>{plant.light}h</span>
                    </div>
                    <div className="stat">
                        <Thermometer size={16} className="text-red-500" />
                        <span>{plant.temp}°C</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlantCard;
