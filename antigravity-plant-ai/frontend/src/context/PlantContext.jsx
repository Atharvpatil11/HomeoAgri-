import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const PlantContext = createContext();

export const usePlantContext = () => useContext(PlantContext);

export const PlantProvider = ({ children }) => {
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([
        { id: 1, plantId: 2, type: 'warning', message: 'Water level low for Fiddle Leaf Fig. 200ml recommended.', time: '2h ago' },
        { id: 2, plantId: null, type: 'danger', message: 'High temperature detected in Green House Zone 1!', time: '1h ago' },
        { id: 3, plantId: 1, type: 'success', message: 'Monstera analysis complete: Plant is 100% healthy.', time: '30m ago' }
    ]);

    const [treatments, setTreatments] = useState([]);
    const [scanCount, setScanCount] = useState(0);

    // Mock initial load
    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        setLoading(true);
        try {
            const response = await api.get('/plants');
            if (response.data && response.data.length > 0) {
                setPlants(response.data);
                setScanCount(response.data.length);
                setLoading(false);
                return;
            }

            // Fallback to Mock Data if DB is empty for demo purposes
            setPlants([
                {
                    id: 1,
                    name: 'Mandevilla (Red Blossom)',
                    species: 'Mandevilla Sanderi',
                    status: 'Healthy',
                    height: 45,
                    health_score: 95,
                    moisture: 65,
                    light: 8,
                    temp: 24,
                    image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80',
                    last_watered: '2023-10-25T10:00:00',
                    timestamp: new Date().toISOString(),
                    location: 'South Farm'
                },
                {
                    id: 2,
                    name: 'Anthurium (Red Heart)',
                    species: 'Anthurium Andraeanum',
                    status: 'Warning',
                    height: 60,
                    health_score: 65,
                    moisture: 40,
                    light: 6,
                    temp: 22,
                    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
                    last_watered: '2023-10-24T08:30:00',
                    timestamp: new Date().toISOString(),
                    location: 'Greenhouse Zone A'
                }
            ]);
            setScanCount(2);
            setLoading(false);
        } catch (err) {
            console.error("API error, using mock data:", err);
            setPlants([
                { id: 1, name: 'Mandevilla (Red Blossom)', species: 'Mandevilla Sanderi', status: 'Healthy', height: 45, health_score: 95, moisture: 65, light: 8, temp: 24, image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80', timestamp: new Date().toISOString() },
                { id: 2, name: 'Anthurium (Red Heart)', species: 'Anthurium Andraeanum', status: 'Warning', height: 60, health_score: 65, moisture: 40, light: 6, temp: 22, image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80', timestamp: new Date().toISOString() }
            ]);
            setScanCount(2);
            setLoading(false);
        }
    };

    const addPlant = (plant) => {
        const now = new Date();
        const newPlant = {
            ...plant,
            id: plant.id || Date.now(),
            timestamp: plant.timestamp || now.toISOString(),
            savedAt: now.toISOString()
        };
        setPlants(prev => [newPlant, ...prev]);
        setScanCount(prev => prev + 1);
    };

    const addTreatment = (treatment) => {
        const now = new Date();
        const newTreatment = {
            ...treatment,
            id: treatment.id || Date.now(),
            timestamp: now.toISOString(),
            savedAt: now.toISOString()
        };
        setTreatments(prev => [newTreatment, ...prev]);
    };

    const dismissAlert = (id) => {
        setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    const removePlant = (id) => {
        setPlants(prev => prev.filter(plant => String(plant.id) !== String(id)));
        setScanCount(prev => prev - 1); // Optional: Decrement scan count when deleted
    };

    const removeTreatment = (id) => {
        setTreatments(prev => prev.filter(treatment => String(treatment.id) !== String(id)));
    };

    return (
        <PlantContext.Provider value={{
            plants,
            selectedPlant,
            setSelectedPlant,
            loading,
            error,
            activeAlerts,
            treatments,
            scanCount,
            addPlant,
            removePlant,
            removeTreatment,
            addTreatment,
            dismissAlert,
            fetchPlants
        }}>
            {children}
        </PlantContext.Provider>
    );
};
