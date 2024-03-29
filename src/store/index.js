import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { userReducer, setToken, setUserInfo } from "./slices/userSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} 
from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
const persistConfig = {
  key: "root",
  storage,
};
const reducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export { store, setToken, setUserInfo };
