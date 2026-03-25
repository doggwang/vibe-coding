import React, { useState, useEffect } from 'react';
import { Polyline } from 'react-leaflet';
import { useApp } from '../context/AppContext';
import { filterPhotosByTag, sortPhotosByTime } from '../utils/mapUtils';

let globalTraceSettings = {
  startDate: '',
  endDate: '',
  traceColor: '#3b82f6',
  traceWidth: 3
};

export const setGlobalTraceSettings = (settings) => {
  globalTraceSettings = { ...globalTraceSettings, ...settings };
};

const TraceLine = () => {
  const { photos, selectedTag, showTrace } = useApp();
  const [settings, setSettings] = useState(globalTraceSettings);

  useEffect(() => {
    const interval = setInterval(() => {
      setSettings({ ...globalTraceSettings });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const filteredPhotos = filterPhotosByTag(photos, selectedTag);
  const sortedPhotos = sortPhotosByTime(filteredPhotos.filter(p => p.gps && p.createTime));

  const filterByDateRange = (photos) => {
    if (!settings.startDate && !settings.endDate) return photos;
    
    return photos.filter(photo => {
      if (!photo.createTime) return false;
      const photoDate = new Date(photo.createTime).getTime();
      
      if (settings.startDate && photoDate < new Date(settings.startDate).getTime()) return false;
      if (settings.endDate && photoDate > new Date(settings.endDate).getTime()) return false;
      
      return true;
    });
  };

  const datedPhotos = filterByDateRange(sortedPhotos);

  const positions = datedPhotos.map(photo => [
    photo.gps.latitude,
    photo.gps.longitude
  ]);

  if (!showTrace || positions.length < 2) {
    return null;
  }

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: settings.traceColor,
        weight: settings.traceWidth,
        opacity: 0.8
      }}
    />
  );
};

const TraceSettings = () => {
  const { photos, showTrace, setShowTrace } = useApp();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [traceColor, setTraceColor] = useState('#3b82f6');
  const [traceWidth, setTraceWidth] = useState(3);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setGlobalTraceSettings({ startDate: '', endDate: '' });
  };

  const handleSettingChange = (key, value) => {
    setGlobalTraceSettings({ [key]: value });
  };

  const photosWithGps = photos.filter(p => p.gps && p.createTime);
  
  return (
    <div>
      <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>旅行轨迹</h2>

      {photosWithGps.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>需要至少2张带GPS的照片</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>当前已有 {photosWithGps.length} 张</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="show-trace"
              checked={showTrace}
              onChange={(e) => setShowTrace(e.target.checked)}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label htmlFor="show-trace" style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
              显示轨迹
            </label>
          </div>

          {showTrace && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      handleSettingChange('startDate', e.target.value);
                    }}
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      handleSettingChange('endDate', e.target.value);
                    }}
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s' }}
                  />
                </div>
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={handleResetFilters}
                  style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  清除日期筛选
                </button>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  轨迹颜色
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setTraceColor(color);
                        handleSettingChange('traceColor', color);
                      }}
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '9999px',
                        border: '2px solid',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        background: color,
                        borderColor: traceColor === color ? '#111827' : '#d1d5db',
                        transform: traceColor === color ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: traceColor === color ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  轨迹粗细: {traceWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={traceWidth}
                  onChange={(e) => {
                    setTraceWidth(parseInt(e.target.value));
                    handleSettingChange('traceWidth', parseInt(e.target.value));
                  }}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { TraceLine, TraceSettings };
