import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  PHOTOS: 'photos',
  TAGS: 'tags',
};

export const useAppContext = () => {
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showTrace, setShowTrace] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(() => {
    try {
      const savedPhotos = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      const savedTags = localStorage.getItem(STORAGE_KEYS.TAGS);
      
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        setPhotos(Array.isArray(parsedPhotos) ? parsedPhotos : []);
      }
      
      if (savedTags) {
        const parsedTags = JSON.parse(savedTags);
        setTags(Array.isArray(parsedTags) ? parsedTags : []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setPhotos([]);
      setTags([]);
    }
  }, []);

  const saveData = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error('保存数据失败:', error);
      alert('保存数据失败，请检查浏览器存储空间');
    }
  }, [photos, tags]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  const addPhoto = useCallback((photo) => {
    setPhotos(prev => [...prev, photo]);
  }, []);

  const updatePhoto = useCallback((photoId, updates) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
  }, []);

  const deletePhoto = useCallback((photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  }, []);

  const addTag = useCallback((tag) => {
    setTags(prev => [...prev, tag]);
  }, []);

  const updateTag = useCallback((tagId, updates) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    ));
  }, []);

  const deleteTag = useCallback((tagId) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      tags: photo.tags.filter(tag => tag !== tagId)
    })));
  }, []);

  const exportData = useCallback(() => {
    const data = { photos, tags };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-travel-map-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [photos, tags]);

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (!Array.isArray(data.photos) || !Array.isArray(data.tags)) {
            throw new Error('无效的数据格式');
          }
          
          setPhotos(data.photos);
          setTags(data.tags);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }, []);

  const clearAllData = useCallback(() => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem(STORAGE_KEYS.PHOTOS);
      localStorage.removeItem(STORAGE_KEYS.TAGS);
      setPhotos([]);
      setTags([]);
      setSelectedTag(null);
      setSelectedPhoto(null);
    }
  }, []);

  const getPhotosByTag = useCallback((tagId) => {
    if (!tagId) return photos;
    return photos.filter(photo => photo.tags.includes(tagId));
  }, [photos]);

  const value = {
    photos,
    tags,
    selectedTag,
    selectedPhoto,
    showTrace,
    loading,
    setSelectedTag,
    setSelectedPhoto,
    setShowTrace,
    setLoading,
    addPhoto,
    updatePhoto,
    deletePhoto,
    addTag,
    updateTag,
    deleteTag,
    exportData,
    importData,
    clearAllData,
    getPhotosByTag,
  };

  return value;
};

export default useAppContext;
