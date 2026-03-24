import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui';

const TagManager = () => {
  const { tags, photos, selectedTag, setSelectedTag, addTag, updateTag, deleteTag } = useAppContext();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    const existingTag = tags.find(t => t.name === newTagName);
    if (existingTag) {
      alert('标签已存在');
      return;
    }

    const newTag = {
      id: Date.now().toString(),
      name: newTagName,
      color: getRandomColor(),
      count: 0
    };

    addTag(newTag);
    setNewTagName('');
  };

  const handleUpdateTag = () => {
    if (!editName.trim()) return;
    
    updateTag(editingTag.id, {
      name: editName,
      color: editColor
    });
    
    setEditingTag(null);
    setEditName('');
    setEditColor('#3b82f6');
  };

  const handleDeleteTag = (tagId) => {
    const tag = tags.find(t => t.id === tagId);
    if (confirm(`确定要删除标签"${tag.name}"吗？`)) {
      deleteTag(tagId);
      if (selectedTag === tagId) {
        setSelectedTag(null);
      }
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getTagCount = (tagId) => {
    return photos.filter(photo => photo.tags.includes(tagId)).length;
  };

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>标签筛选</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="新标签名称"
          style={{
            flex: 1,
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        />
        <Button onClick={handleAddTag} variant="primary" size="md">
          添加
        </Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setSelectedTag(null)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s',
            background: selectedTag === null ? '#3b82f6' : '#f3f4f6',
            color: selectedTag === null ? 'white' : '#374151',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          全部
        </button>

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              background: selectedTag === tag.id ? tag.color : '#f3f4f6',
              color: selectedTag === tag.id ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              boxShadow: selectedTag === tag.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              transform: selectedTag === tag.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {tag.name}
            <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', opacity: '0.75' }}>({getTagCount(tag.id)})</span>
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>编辑标签</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tags.map((tag) => (
              <div
                key={tag.id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              >
                <div
                  style={{ width: '1rem', height: '1rem', borderRadius: '9999px', flexShrink: 0, background: tag.color }}
                ></div>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#1f2937' }}>{tag.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>({getTagCount(tag.id)})</span>
                <button
                  onClick={() => {
                    setEditingTag(tag);
                    setEditName(tag.name);
                    setEditColor(tag.color);
                  }}
                  style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingTag && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1040, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem', maxWidth: '24rem', width: '100%', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>编辑标签</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>标签名称</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>标签颜色</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '9999px',
                        border: '2px solid',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        background: color,
                        borderColor: editColor === color ? '#111827' : '#d1d5db',
                        transform: editColor === color ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button 
                onClick={() => setEditingTag(null)} 
                variant="outline" 
                size="md"
              >
                取消
              </Button>
              <Button 
                onClick={handleUpdateTag} 
                variant="primary" 
                size="md"
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;