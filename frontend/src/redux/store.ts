import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage';
import appReducer from './appSlice';
import authReducer from './authSlice';
import attendanceReducer from './attendanceSlice';
import leaveReducer from './leaveSlice';

// Server ab source-of-truth hai, isliye attendance/leave/auth ko persist nahi karte
// (wo har baar backend se fresh aate hain). Login token alag se localStorage me
// rehta hai (see api/client.ts) aur app load par "/me" se session wapas aata hai.
const persistConfig = {
  key: 'kuberya-attendance',
  storage,
  whitelist: [] as string[],
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  attendance: attendanceReducer,
  leave: leaveReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
