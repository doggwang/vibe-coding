import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { parsePhotoExif, createThumbnail, createPhotoUrl } from '../utils/exifParser';
import { LoadingSpinner } from './ui';

const PhotoUpload = () => {
  const { addPhoto, setLoading, tags, addTag } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setLoading(true);

    const photoPromises = files.map(async (file) => {
      try {
        const exifData = await parsePhotoExif(file);
        const photoUrl = await createPhotoUrl(file);
        const thumbnailUrl = await createThumbnail(file);

        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: photoUrl,
          thumbnailUrl: thumbnailUrl,
          gps: exifData.gps,
          createTime: exifData.createTime || new Date().toISOString(),
          tags: [],
          cameraInfo: exifData.cameraInfo,
          manualTime: exifData.createTime ? new Date(exifData.createTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          manualAddress: exifData.gps?.address || '',
          selectedLocation: exifData.gps ? {
            lat: exifData.gps.latitude,
            lng: exifData.gps.longitude
          } : null,
          showLocationPicker: false
        };
      } catch (error) {
        console.error('解析照片失败:', error);
        return null;
      }
    });

    const photos = await Promise.all(photoPromises);
    const validPhotos = photos.filter(p => p !== null);
    
    setPreviewPhotos(validPhotos);
    setCurrentIndex(0);
    setUploading(false);
    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const event = { target: { files: e.dataTransfer.files } };
      handleFileSelect(event);
    }
  };

  const handleLocationSearch = async (photoIndex) => {
    const photo = previewPhotos[photoIndex];
    if (!photo.manualAddress.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(photo.manualAddress)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        const updatedPhotos = [...previewPhotos];
        updatedPhotos[photoIndex] = {
          ...updatedPhotos[photoIndex],
          selectedLocation: {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
          },
          manualAddress: location.display_name || photo.manualAddress
        };
        setPreviewPhotos(updatedPhotos);
      } else {
        alert('未找到该地址，请尝试其他搜索词');
      }
    } catch (error) {
      console.error('搜索位置失败:', error);
      alert('搜索位置失败，请稍后重试');
    }
  };

  const handleAddNewTag = (photoIndex, newTagName) => {
    if (!newTagName.trim()) return;
    
    const existingTag = tags.find(t => t.name === newTagName);
    if (existingTag) {
      const updatedPhotos = [...previewPhotos];
      if (!updatedPhotos[photoIndex].tags.includes(existingTag.id)) {
        updatedPhotos[photoIndex] = {
          ...updatedPhotos[photoIndex],
          tags: [...updatedPhotos[photoIndex].tags, existingTag.id]
        };
        setPreviewPhotos(updatedPhotos);
      }
      return;
    }

    const newTag = {
      id: Date.now().toString(),
      name: newTagName,
      color: getRandomColor()
    };

    addTag(newTag);
    
    const updatedPhotos = [...previewPhotos];
    updatedPhotos[photoIndex] = {
      ...updatedPhotos[photoIndex],
      tags: [...updatedPhotos[photoIndex].tags, newTag.id]
    };
    setPreviewPhotos(updatedPhotos);
  };

  const getRandomColor = () => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const toggleTag = (photoIndex, tagId) => {
    const updatedPhotos = [...previewPhotos];
    const currentTags = updatedPhotos[photoIndex].tags;
    
    if (currentTags.includes(tagId)) {
      updatedPhotos[photoIndex] = {
        ...updatedPhotos[photoIndex],
        tags: currentTags.filter(id => id !== tagId)
      };
    } else {
      updatedPhotos[photoIndex] = {
        ...updatedPhotos[photoIndex],
        tags: [...currentTags, tagId]
      };
    }
    
    setPreviewPhotos(updatedPhotos);
  };

  const updatePhotoField = (photoIndex, field, value) => {
    const updatedPhotos = [...previewPhotos];
    updatedPhotos[photoIndex] = {
      ...updatedPhotos[photoIndex],
      [field]: value
    };
    setPreviewPhotos(updatedPhotos);
  };

  const handleSavePhoto = (photoIndex) => {
    const photo = previewPhotos[photoIndex];
    
    const updatedPhoto = {
      id: photo.id,
      name: photo.name,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      gps: photo.selectedLocation ? {
        latitude: photo.selectedLocation.lat,
        longitude: photo.selectedLocation.lng,
        address: photo.manualAddress
      } : null,
      createTime: photo.manualTime || new Date().toISOString(),
      tags: photo.tags,
      cameraInfo: photo.cameraInfo
    };

    addPhoto(updatedPhoto);

    if (photoIndex < previewPhotos.length - 1) {
      setCurrentIndex(photoIndex + 1);
    } else {
      setPreviewPhotos([]);
      setCurrentIndex(0);
      alert('所有照片上传完成！');
    }
  };

  const handleSaveAll = () => {
    previewPhotos.forEach((photo, index) => {
      const updatedPhoto = {
        id: photo.id,
        name: photo.name,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        gps: photo.selectedLocation ? {
          latitude: photo.selectedLocation.lat,
          longitude: photo.selectedLocation.lng,
          address: photo.manualAddress
        } : null,
        createTime: photo.manualTime || new Date().toISOString(),
        tags: photo.tags,
        cameraInfo: photo.cameraInfo
      };
      addPhoto(updatedPhoto);
    });
    
    setPreviewPhotos([]);
    setCurrentIndex(0);
    alert('所有照片上传完成！');
  };

  const handleCancel = () => {
    setPreviewPhotos([]);
    setCurrentIndex(0);
    setWindowPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - windowPosition.x,
      y: e.clientY - windowPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setWindowPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>上传照片</h2>
      
      {uploading ? (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '1rem' }}>正在处理照片...</p>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '0.75rem',
            border: '2px dashed #d1d5db',
            padding: '1.5rem',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="photo-upload"
            accept="image/*,.webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            style={{ cursor: 'pointer' }}
          >
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              background: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)', 
              borderRadius: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <svg style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>上传照片</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>点击或拖拽文件到此处</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>支持 JPG, PNG, WebP 格式</p>
          </label>
        </div>
      )}

      {previewPhotos.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onMouseDown={handleMouseDown}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-[40vw] h-[60vh] overflow-hidden flex flex-col border border-gray-200"
            style={{
              position: 'absolute',
              left: `calc(50% + ${windowPosition.x}px)`,
              top: `calc(50% + ${windowPosition.y}px)`,
              transform: 'translate(-50%, -50%)',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  照片预览 <span className="text-blue-500">({currentIndex + 1}/{previewPhotos.length})</span>
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{previewPhotos[currentIndex].name}</p>
              </div>
              <button
                onClick={handleCancel}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <img
                    src={previewPhotos[currentIndex].url}
                    alt={previewPhotos[currentIndex].name}
                    className="w-full h-48 object-contain rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">拍摄时间 *</label>
                    <input
                      type="datetime-local"
                      value={previewPhotos[currentIndex].manualTime}
                      onChange={(e) => updatePhotoField(currentIndex, 'manualTime', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">拍摄地点</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={previewPhotos[currentIndex].manualAddress}
                        onChange={(e) => updatePhotoField(currentIndex, 'manualAddress', e.target.value)}
                        placeholder="输入地址搜索"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => handleLocationSearch(currentIndex)}
                        className="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        搜索
                      </button>
                    </div>
                    {previewPhotos[currentIndex].selectedLocation && (
                      <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-xs text-blue-800">
                        已选择: {previewPhotos[currentIndex].manualAddress}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">选择标签</label>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(currentIndex, tag.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              previewPhotos[currentIndex].tags.includes(tag.id)
                                ? 'text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={{
                              backgroundColor: previewPhotos[currentIndex].tags.includes(tag.id) ? tag.color : undefined
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="新标签"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewTag(currentIndex, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          handleAddNewTag(currentIndex, input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex gap-2">
                {previewPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      上一张
                    </button>
                    <button
                      onClick={() => setCurrentIndex(Math.min(previewPhotos.length - 1, currentIndex + 1))}
                      disabled={currentIndex === previewPhotos.length - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      下一张
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={() => handleSavePhoto(currentIndex)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
                >
                  保存当前
                </button>
                <button
                  onClick={handleSaveAll}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
                >
                  全部保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
