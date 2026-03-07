import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    driver: null, // Driver info (optional) 
    plants: [],
    selectedPlant: null,
    loading: false,
    error: null,
};

const plantSlice = createSlice({
    name: 'plants',
    initialState,
    reducers: {
        setPlants: (state, action) => {
            state.plants = action.payload;
        },
        addPlant: (state, action) => {
            state.plants.push(action.payload);
        },
        setSelectedPlant: (state, action) => {
            state.selectedPlant = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setPlants, addPlant, setSelectedPlant, setLoading, setError } = plantSlice.actions;
export default plantSlice.reducer;
