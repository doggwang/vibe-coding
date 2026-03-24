import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showTrace, setShowTrace] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedPhotos = localStorage.getItem('photos');
      const savedTags = localStorage.getItem('tags');
      if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
      if (savedTags) setTags(JSON.parse(savedTags));
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('photos', JSON.stringify(photos));
      localStorage.setItem('tags', JSON.stringify(tags));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  const addPhoto = (photo) => {
    setPhotos(prev => [...prev, photo]);
    saveData();
  };

  const updatePhoto = (photoId, updates) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
    saveData();
  };

  const deletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    saveData();
  };

  const addTag = (tag) => {
    setTags(prev => [...prev, tag]);
    saveData();
  };

  const updateTag = (tagId, updates) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    ));
    saveData();
  };

  const deleteTag = (tagId) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      tags: photo.tags.filter(tag => tag !== tagId)
    })));
    saveData();
  };

  const exportData = () => {
    const data = { photos, tags };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-travel-map-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setPhotos(data.photos || []);
          setTags(data.tags || []);
          saveData();
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const value = {
    photos,
    tags,
    selectedTag,
    showTrace,
    loading,
    setSelectedTag,
    setShowTrace,
    setLoading,
    addPhoto,
    updatePhoto,
    deletePhoto,
    addTag,
    updateTag,
    deleteTag,
    exportData,
    importData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
