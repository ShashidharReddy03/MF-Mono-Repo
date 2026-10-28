import { createSlice } from "@reduxjs/toolkit";

/** Counter (not boolean) so parallel requests don't hide the loader early */
const loaderSlice = createSlice({
  name: "loader",
  initialState: { pending: 0 },
  reducers: {
    startLoading: (s) => {
      s.pending += 1;
    },
    stopLoading: (s) => {
      s.pending = Math.max(0, s.pending - 1);
    },
  },
});

export const { startLoading, stopLoading } = loaderSlice.actions;
export default loaderSlice.reducer;
