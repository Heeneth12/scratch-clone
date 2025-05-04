import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSpriteId: 1,
  isPlaying: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedSpriteId: (state, action) => {
      state.selectedSpriteId = action.payload;
    },
    togglePlaying: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
  },
});

export const { setSelectedSpriteId, togglePlaying, setPlaying } =
  uiSlice.actions;

export default uiSlice.reducer;
