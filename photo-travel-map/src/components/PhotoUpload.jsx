import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { parsePhotoExif, createThumbnail, createPhotoUrl } from '../utils/exifParser';
import { LoadingSpinner } from './ui';

const PhotoUpload = () => {
  const { addPhoto, setLoading, tags, addTag } = useApp();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [cancelUpload, setCancelUpload] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setLoading(true);
    setUploadTotal(files.length);
    setUploadProgress(0);
    setCancelUpload(false);

    const validPhotos = [];
    
    for (let i = 0; i < files.length; i++) {
      if (cancelUpload) {
        break;
      }
      
      const file = files[i];
      setUploadProgress(i + 1);
      
      try {
        const exifData = await parsePhotoExif(file);
        const photoUrl = await createPhotoUrl(file);
        const thumbnailUrl = await createThumbnail(file);

        validPhotos.push({
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
        });
      } catch (error) {
        console.error('解析照片失败:', error);
      }
    }
    
    if (!cancelUpload && validPhotos.length > 0) {
      setPreviewPhotos(validPhotos);
      setCurrentIndex(0);
    }
    
    setUploading(false);
    setLoading(false);
    setUploadProgress(0);
    setUploadTotal(0);
  };

  const handleCancelUpload = () => {
    setCancelUpload(true);
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
      <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wider mb-4">上传照片</h2>
      
      {uploading ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4 font-medium">正在处理照片...</p>
          {uploadTotal > 0 && (
            <>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {uploadProgress} / {uploadTotal} 张照片
              </p>
              <button
                onClick={handleCancelUpload}
                className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                取消上传
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className={`bg-white rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 cursor-pointer group ${
            dragActive 
              ? 'border-amber-400 bg-amber-50/50 scale-[1.02] shadow-xl shadow-amber-500/10' 
              : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50/50 hover:scale-[1.01]'
          }`}
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
          <label htmlFor="photo-upload" className="cursor-pointer block">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">上传照片</h3>
            <p className="text-sm text-slate-500">点击或拖拽文件到此处</p>
            <p className="text-xs text-slate-400 mt-2">支持 JPG, PNG, WebP 格式</p>
          </label>
        </div>
      )}

      {previewPhotos.length > 0 && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300"
          onMouseDown={handleMouseDown}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-[45vw] h-[65vh] overflow-hidden flex flex-col border border-slate-200"
            style={{
              position: 'absolute',
              left: `calc(50% + ${windowPosition.x}px)`,
              top: `calc(50% + ${windowPosition.y}px)`,
              transform: 'translate(-50%, -50%)',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  照片预览 <span className="text-amber-500">({currentIndex + 1}/{previewPhotos.length})</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">{previewPhotos[currentIndex].name}</p>
              </div>
              <button
                onClick={handleCancel}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <img
                    src={previewPhotos[currentIndex].url}
                    alt={previewPhotos[currentIndex].name}
                    className="w-full h-52 object-contain rounded-xl shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">拍摄时间 *</label>
                    <input
                      type="datetime-local"
                      value={previewPhotos[currentIndex].manualTime}
                      onChange={(e) => updatePhotoField(currentIndex, 'manualTime', e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">拍摄地点</label>
                    {!previewPhotos[currentIndex].gps && !previewPhotos[currentIndex].selectedLocation && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-800">此照片没有GPS信息</p>
                          <p className="text-xs text-amber-700 mt-0.5">请在下方输入地址，手动添加拍摄地点</p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={previewPhotos[currentIndex].manualAddress}
                        onChange={(e) => updatePhotoField(currentIndex, 'manualAddress', e.target.value)}
                        placeholder="输入地址搜索"
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => handleLocationSearch(currentIndex)}
                        className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        搜索
                      </button>
                    </div>
                    {previewPhotos[currentIndex].selectedLocation && (
                      <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl text-xs text-blue-800">
                        已选择: {previewPhotos[currentIndex].manualAddress}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">选择标签</label>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(currentIndex, tag.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              previewPhotos[currentIndex].tags.includes(tag.id)
                                ? 'text-white shadow-lg transform scale-105'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
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
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                        className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex gap-2">
                {previewPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                    >
                      上一张
                    </button>
                    <button
                      onClick={() => setCurrentIndex(Math.min(previewPhotos.length - 1, currentIndex + 1))}
                      disabled={currentIndex === previewPhotos.length - 1}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                    >
                      下一张
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all hover:shadow-md"
                >
                  取消
                </button>
                <button
                  onClick={() => handleSavePhoto(currentIndex)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl hover:scale-105"
                >
                  保存当前
                </button>
                <button
                  onClick={handleSaveAll}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl hover:scale-105"
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
