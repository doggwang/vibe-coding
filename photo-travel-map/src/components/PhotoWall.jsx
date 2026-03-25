import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { filterPhotosByTag, sortPhotosByTime } from '../utils/mapUtils';
import { EmptyState } from './ui';

const PhotoWall = () => {
  const { photos, selectedTags, tags, selectedPhoto, setSelectedPhoto, getPhotosByTags, updatePhoto } = useApp();
  const filteredPhotos = getPhotosByTags(selectedTags);
  const sortedPhotos = sortPhotosByTime(filteredPhotos);
  const photoRefs = useRef({});
  const [batchMode, setBatchMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showBatchTagModal, setShowBatchTagModal] = useState(false);
  const [newBatchTag, setNewBatchTag] = useState('');

  const getTagName = (tagId) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : tagId;
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(sortedPhotos.map(p => p.id));
  };

  const clearPhotoSelection = () => {
    setSelectedPhotos([]);
  };

  const handleBatchAddTag = () => {
    if (!newBatchTag.trim() || selectedPhotos.length === 0) return;
    
    const existingTag = tags.find(t => t.name === newBatchTag);
    const tagId = existingTag ? existingTag.id : Date.now().toString();
    
    if (!existingTag) {
      const newTag = {
        id: tagId,
        name: newBatchTag,
        color: getRandomColor()
      };
    }

    selectedPhotos.forEach(photoId => {
      const photo = photos.find(p => p.id === photoId);
      if (photo && !photo.tags.includes(tagId)) {
        updatePhoto(photoId, {
          tags: [...photo.tags, tagId]
        });
      }
    });

    setNewBatchTag('');
    setShowBatchTagModal(false);
    clearPhotoSelection();
  };

  const getRandomColor = () => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{sortedPhotos.length} 张照片</span>
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              batchMode 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {batchMode ? '退出批量' : '批量操作'}
          </button>
        </div>
      </div>

      {batchMode && (
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <button
            onClick={selectAllPhotos}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-xl text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            全选
          </button>
          <button
            onClick={clearPhotoSelection}
            className="px-3 py-1.5 bg-slate-500 text-white rounded-xl text-xs font-medium hover:bg-slate-600 transition-colors"
          >
            取消选择
          </button>
          {selectedPhotos.length > 0 && (
            <button
              onClick={() => setShowBatchTagModal(true)}
              className="px-3 py-1.5 bg-green-500 text-white rounded-xl text-xs font-medium hover:bg-green-600 transition-colors"
            >
              添加标签 ({selectedPhotos.length})
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.id}
            ref={(el) => photoRefs.current[photo.id] = el}
            onClick={() => batchMode ? togglePhotoSelection(photo.id) : handlePhotoClick(photo)}
            className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
              batchMode && selectedPhotos.includes(photo.id)
                ? 'ring-2 ring-green-500 ring-offset-2 shadow-xl shadow-green-500/20 scale-[1.02]'
                : batchMode
                ? 'border-2 border-slate-300 hover:border-green-400 hover:shadow-lg'
                : selectedPhoto === photo.id 
                  ? 'ring-2 ring-amber-500 ring-offset-2 shadow-xl shadow-amber-500/20 scale-[1.02]' 
                  : 'border border-slate-200 hover:border-amber-300 hover:shadow-lg hover:scale-[1.01]'
            }`}
          >
            {batchMode && (
              <div className="absolute top-2 left-2 z-10">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedPhotos.includes(photo.id)
                    ? 'bg-green-500 border-green-600 text-white'
                    : 'bg-white border-slate-300'
                }`}>
                  {selectedPhotos.includes(photo.id) && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
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

      {showBatchTagModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              批量添加标签
              <span className="text-sm text-slate-500 font-normal ml-2">({selectedPhotos.length} 张照片)</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">标签名称</label>
                <input
                  type="text"
                  value={newBatchTag}
                  onChange={(e) => setNewBatchTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBatchAddTag()}
                  placeholder="输入新标签名称"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">或选择已有标签</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setNewBatchTag(tag.name);
                        handleBatchAddTag();
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md"
                      style={{ backgroundColor: tag.color, color: 'white' }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBatchTagModal(false);
                  setNewBatchTag('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all hover:shadow-md"
              >
                取消
              </button>
              <button
                onClick={handleBatchAddTag}
                disabled={!newBatchTag.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加标签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoWall;
