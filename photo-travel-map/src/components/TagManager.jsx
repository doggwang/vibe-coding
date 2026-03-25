import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import { Button } from './ui';

const TagManager = () => {
  const { tags, photos, selectedTags, toggleTagSelection, clearTagSelection, addTag, updateTag, deleteTag } = useApp();
  const { warning, success } = useToast();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    const existingTag = tags.find(t => t.name === newTagName);
    if (existingTag) {
      warning('标签已存在');
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
    success('标签添加成功');
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
      <h2 className="text-base font-semibold text-slate-800 uppercase tracking-wider mb-4">标签筛选</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="新标签名称"
          className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
        <Button onClick={handleAddTag} variant="primary" size="md">
          添加
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={clearTagSelection}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedTags.length === 0 
              ? 'bg-amber-500 text-white shadow-lg transform scale-105' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          全部
        </button>

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTagSelection(tag.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedTags.includes(tag.id) 
                ? 'text-white shadow-lg transform scale-105' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
            }`}
            style={{
              backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined
            }}
          >
            {tag.name}
            <span className="ml-1.5 text-[10px] opacity-75">({getTagCount(tag.id)})</span>
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3">编辑标签</h3>
          <div className="flex flex-col gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ background: tag.color }}
                ></div>
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-800">{tag.name}</span>
                <span className="text-xs text-slate-500">({getTagCount(tag.id)})</span>
                <button
                  onClick={() => {
                    setEditingTag(tag);
                    setEditName(tag.name);
                    setEditColor(tag.color);
                  }}
                  className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingTag && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1040] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
            <h3 className="text-base font-semibold text-slate-800 mb-4">编辑标签</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">标签名称</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">标签颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                        editColor === color ? 'border-slate-900 scale-110' : 'border-slate-300'
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
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