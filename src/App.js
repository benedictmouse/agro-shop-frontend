// src/App.js
import React from 'react';
import BaseRouter from './routing/Routes';
import { AuthProvider } from './context/AuthContext'
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BaseRouter />
    </AuthProvider>
  );
}

export default App;