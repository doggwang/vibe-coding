import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { filterPhotosByTag, sortPhotosByTime } from '../utils/mapUtils';
import { EmptyState } from './ui';

const PhotoWall = () => {
  const { photos, selectedTag, tags, selectedPhoto, setSelectedPhoto } = useApp();
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">照片墙</h2>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{sortedPhotos.length} 张照片</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.id}
            ref={(el) => photoRefs.current[photo.id] = el}
            onClick={() => handlePhotoClick(photo)}
            className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
              selectedPhoto === photo.id 
                ? 'ring-2 ring-amber-500 ring-offset-2 shadow-xl shadow-amber-500/20 scale-[1.02]' 
                : 'border border-slate-200 hover:border-amber-300 hover:shadow-lg hover:scale-[1.01]'
            }`}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {photo.tags.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                  {photo.tags.slice(0, 2).map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return (
                      <span
                        key={tagId}
                        className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[10px] font-semibold text-slate-700 rounded-lg shadow-lg"
                        style={{ backgroundColor: tag ? `${tag.color}E6` : undefined }}
                      >
                        {getTagName(tagId)}
                      </span>
                    );
                  })}
                  {photo.tags.length > 2 && (
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[10px] font-semibold text-slate-700 rounded-lg shadow-lg">
                      +{photo.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-white transition-colors duration-300 group-hover:bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-800 truncate mb-2">{photo.name}</h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{photo.gps?.address || '未知位置'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
