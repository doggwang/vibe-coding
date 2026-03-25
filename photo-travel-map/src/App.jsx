import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import PhotoUpload from './components/PhotoUpload';
import MapContainer from './components/MapContainer';
import TagManager from './components/TagManager';
import { TraceSettings } from './components/TraceLine';
import BackupManager from './components/BackupManager';
import PhotoWall from './components/PhotoWall';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden">
          <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} 
              />
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-transform duration-300">
                <span className="text-2xl">📸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">照片旅行地图</h1>
                <p className="text-xs text-amber-200/80 font-medium tracking-wide uppercase">记录你的每一次旅行</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-2">
              <button className="p-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/5 group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/5 group">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden bg-slate-50">
            <aside className="w-[280px] flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
              <div className="p-5 space-y-6">
                <PhotoUpload />
                <TagManager />
                <div className="flex flex-col gap-4">
                  <h2 className="text-base font-semibold text-slate-800 uppercase tracking-wider">其他设置</h2>
                  <TraceSettings />
                  <BackupManager />
                </div>
              </div>
            </aside>

            <section className="flex-1 overflow-hidden relative bg-slate-100">
              <MapContainer />
            </section>

            <aside className="w-[320px] flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
              <PhotoWall />
            </aside>
          </main>
        </div>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
