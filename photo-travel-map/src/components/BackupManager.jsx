import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui';

const BackupManager = () => {
  const { photos, tags, exportData, importData } = useAppContext();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    if (photos.length === 0) {
      alert('暂无数据可导出');
      return;
    }
    exportData();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return

    if (!confirm('导入数据将覆盖现有数据，确定要继续吗？')) {
      e.target.value = '';
      return;
    }

    try {
      await importData(file);
      alert('数据导入成功！');
      e.target.value = '';
    } catch (error) {
      alert('导入失败：' + error.message);
      e.target.value = '';
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：这将删除所有照片和标签数据！')) {
        localStorage.removeItem('photos');
        localStorage.removeItem('tags');
        window.location.reload();
      }
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>数据备份</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <Button
          onClick={handleExport}
          disabled={photos.length === 0}
          variant={photos.length === 0 ? "secondary" : "primary"}
          size="md"
          className="w-full"
        >
          导出数据
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="success"
          size="md"
          className="w-full"
        >
          导入数据
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{photos.length}</div>
          <div className="text-sm text-gray-600 mt-1">照片</div>
        </div>
        <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{tags.length}</div>
          <div className="text-sm text-gray-600 mt-1">标签</div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={handleClearData}
          className="w-full py-2.5 px-4 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          清空所有数据
        </button>
      </div>
    </div>
  );
};

export default BackupManager;
