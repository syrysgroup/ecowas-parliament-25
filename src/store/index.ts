import { configureStore } from '@reduxjs/toolkit'
import emailReducer from './slices/email'

export const store = configureStore({
  reducer: {
    emailReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
