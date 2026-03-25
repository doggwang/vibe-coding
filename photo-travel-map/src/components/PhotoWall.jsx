import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { filterPhotosByTag, sortPhotosByTime } from '../utils/mapUtils';
import { EmptyState } from './ui';

const PhotoWall = () => {
  const { photos, selectedTag, tags, selectedPhoto, setSelectedPhoto } = useAppContext();
  const filteredPhotos = filterPhotosByTag(photos, selectedTag);
  const sortedPhotos = sortPhotosByTime(filteredPhotos);
  const photoRefs = useRef({});

  const getTagName = (tagId) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : tagId;
  };

  useEffect(() => {
    if (selectedPhoto && photoRefs.current[selectedPhoto]) {
      photoRefs.current[selectedPhoto].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedPhoto]);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo.id);
  };

  if (sortedPhotos.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="暂无照片"
          description="开始上传你的第一张旅行照片吧"
          action={
            <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg">
              立即上传
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>照片墙</h2>
        <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{sortedPhotos.length} 张照片</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {sortedPhotos.map((photo) => (
          <div
            key={photo.id}
            ref={(el) => photoRefs.current[photo.id] = el}
            onClick={() => handlePhotoClick(photo)}
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: '0.75rem',
              border: selectedPhoto === photo.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              overflow: 'hidden',
              transition: 'all 0.3s',
              cursor: 'pointer',
              boxShadow: selectedPhoto === photo.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
              <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', 
                opacity: 0, 
                transition: 'opacity 0.3s' 
              }} />
              
              {photo.tags.length > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '0.75rem', 
                  left: '0.75rem', 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.375rem',
                  transform: 'translateY(-8px)',
                  opacity: 0,
                  transition: 'all 0.3s 0.1s'
                }}>
                  {photo.tags.slice(0, 2).map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return (
                      <span
                        key={tagId}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: tag ? `${tag.color}E6` : '#ffffff',
                          fontSize: '0.625rem',
                          fontWeight: '500',
                          color: '#374151',
                          borderRadius: '0.5rem',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {getTagName(tagId)}
                      </span>
                    );
                  })}
                  {photo.tags.length > 2 && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      +{photo.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem', transition: 'background 0.3s' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.5rem' }}>{photo.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.625rem', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg style={{ width: '0.75rem', height: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{photo.gps?.address || '未知位置'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(photo.createTime).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoWall;
