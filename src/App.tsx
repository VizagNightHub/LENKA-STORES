import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LenkaHero from './components/LenkaHero';
import LenkaStorefront from './pages/LenkaStorefront';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (The isolated hero you can edit) */}
        <Route path="/" element={<LenkaHero />} />

        {/* Main Storefront page */}
        <Route path="/home" element={<LenkaStorefront />} />
      </Routes>
    </BrowserRouter>
  );
}
