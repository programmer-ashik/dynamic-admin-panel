import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GlobalState {
  rightPanelOpen: boolean;
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
}
const initialState: GlobalState = {
  rightPanelOpen: false,
  sidebarCollapsed: false,
  aiPanelOpen: false,
};
const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setRightPanelOpen: (state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
    sidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setAiPanelOpen: (state) => {
      state.aiPanelOpen = !state.aiPanelOpen;
    },
  },
});

export const { setRightPanelOpen, sidebarCollapsed,setAiPanelOpen } = globalSlice.actions;
export default globalSlice.reducer;
