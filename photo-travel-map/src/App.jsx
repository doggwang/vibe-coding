import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import PhotoUpload from './components/PhotoUpload';
import MapContainer from './components/MapContainer';
import TagManager from './components/TagManager';
import { TraceSettings } from './components/TraceLine';
import BackupManager from './components/BackupManager';
import PhotoWall from './components/PhotoWall';

function App() {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col bg-blue-50 overflow-hidden">
        <header style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', padding: '1rem 1.5rem' }} className="flex items-center justify-between flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div style={{ width: '3rem', height: '3rem', background: 'white', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <span style={{ fontSize: '1.5rem' }}>📸</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>照片旅行地图 - UI已升级</h1>
              <p style={{ fontSize: '0.875rem', color: '#dbeafe' }}>记录你的每一次旅行</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button style={{ padding: '0.75rem', color: 'white', borderRadius: '0.5rem' }}>
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button style={{ padding: '0.75rem', color: 'white', borderRadius: '0.5rem' }}>
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426 1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              <PhotoUpload />
              <TagManager />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>其他设置</h2>
                <TraceSettings />
                <BackupManager />
              </div>
            </div>
          </aside>

          <section className="flex-1 overflow-hidden relative">
            <MapContainer />
          </section>

          <aside className="w-[320px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
            <PhotoWall />
          </aside>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
