import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { filterPhotosByTag } from '../utils/mapUtils';

const PhotoList = () => {
  const { photos, selectedTag, deletePhoto, updatePhoto } = useAppContext();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredPhotos = filterPhotosByTag(photos, selectedTag);

  const handleDeletePhoto = (photoId) => {
    if (confirm('确定要删除这张照片吗？')) {
      deletePhoto(photoId);
      if (selectedPhoto && selectedPhoto.id === photoId) {
        setSelectedPhoto(null);
      }
    }
  };

  const handleAddTag = (photoId, tagName) => {
    if (!tagName.trim()) return;
    
    const photo = photos.find(p => p.id === photoId);
    if (photo && !photo.tags.includes(tagName)) {
      updatePhoto(photoId, { tags: [...photo.tags, tagName] });
    }
  };

  const handleRemoveTag = (photoId, tagName) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      updatePhoto(photoId, { tags: photo.tags.filter(tag => tag !== tagName) });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        照片列表 ({filteredPhotos.length})
      </h2>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无照片</p>
          <p className="text-sm mt-2">点击上方"上传照片"按钮添加照片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                <p className="text-white text-xs truncate">{photo.name}</p>
              </div>
              {photo.gps && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  GPS
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{selectedPhoto.name}</h3>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="w-full h-auto rounded-lg mb-4"
              />

              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-gray-700">拍摄时间：</label>
                  <span className="text-gray-600">
                    {new Date(selectedPhoto.createTime).toLocaleString('zh-CN')}
                  </span>
                </div>

                {selectedPhoto.gps && (
                  <div>
                    <label className="font-semibold text-gray-700">GPS位置：</label>
                    <span className="text-gray-600">
                      {selectedPhoto.gps.latitude.toFixed(6)}, {selectedPhoto.gps.longitude.toFixed(6)}
                    </span>
                    {selectedPhoto.gps.address && (
                      <div className="text-gray-600 mt-1">{selectedPhoto.gps.address}</div>
                    )}
                  </div>
                )}

                {selectedPhoto.cameraInfo && (
                  <div>
                    <label className="font-semibold text-gray-700">相机信息：</label>
                    <span className="text-gray-600">{selectedPhoto.cameraInfo}</span>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700">标签：</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(selectedPhoto.id, tag)}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="添加新标签"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(selectedPhoto.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleAddTag(selectedPhoto.id, input.value);
                        input.value = '';
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  删除照片
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoList;
