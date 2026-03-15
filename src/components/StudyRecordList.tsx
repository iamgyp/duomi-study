'use client';

import { useEffect, useState } from 'react';
import { Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import { StudyRecord } from '@/types/study-record';
import { 
  getRecentRecords, 
  deleteRecord, 
  exportRecords, 
  importRecords,
  formatDuration,
  getSubjectLabel,
  getContentTypeLabel,
} from '@/lib/study-storage';

export function StudyRecordList() {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadRecords();
  }, []);

  const loadRecords = () => {
    setRecords(getRecentRecords(100));
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条学习记录吗？')) {
      deleteRecord(id);
      loadRecords();
    }
  };

  const handleExport = () => {
    const data = exportRecords();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `duomi-study-records-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const result = importRecords(importData);
    if (result >= 0) {
      setImportResult({
        success: true,
        message: `成功导入 ${result} 条学习记录`,
      });
      loadRecords();
      setTimeout(() => {
        setShowImportModal(false);
        setImportData('');
        setImportResult(null);
      }, 1500);
    } else {
      setImportResult({
        success: false,
        message: '导入失败，请检查数据格式是否正确',
      });
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有学习记录吗？此操作不可恢复！')) {
      const { clearAllRecords } = require('@/lib/study-storage');
      clearAllRecords();
      loadRecords();
      setShowClearConfirm(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) {
    return (
      <div className="mc-card bg-white p-4 h-64 animate-pulse" />
    );
  }

  return (
    <div className="space-y-4">
      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExport}
          className="mc-btn bg-[#3B82F6] text-white text-sm py-2 px-4 hover:bg-[#2563EB] flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          导出数据
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="mc-btn bg-[#10B981] text-white text-sm py-2 px-4 hover:bg-[#059669] flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          导入数据
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="mc-btn bg-red-500 text-white text-sm py-2 px-4 hover:bg-red-600 flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          清空记录
        </button>
      </div>

      {/* 记录列表 */}
      <div className="mc-card bg-white overflow-hidden">
        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📚</div>
            <p>还没有学习记录</p>
            <p className="text-sm text-gray-400 mt-1">开始学习后，记录会显示在这里</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {getSubjectLabel(record.subject)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getContentTypeLabel(record.contentType)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {record.contentTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(record.completedAt)} · {formatDuration(record.duration)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="删除记录"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 导入弹窗 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowImportModal(false)}
          />
          <div className="relative bg-[#C6C6C6] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-[#333] mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              导入学习记录
            </h3>
            
            {importResult ? (
              <div className={`p-4 rounded ${importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {importResult.message}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  请粘贴之前导出的 JSON 数据：
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-32 border-2 border-black bg-white p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder='{"version": "1.0", "records": [...]}'
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 mc-btn bg-gray-400 text-white py-2 hover:bg-gray-500"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="flex-1 mc-btn bg-[#10B981] text-white py-2 hover:bg-[#059669] disabled:opacity-50"
                  >
                    导入
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-[#C6C6C6] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-xl font-bold">确认清空</h3>
            </div>
            <p className="text-gray-700 mb-6">
              确定要清空所有学习记录吗？此操作不可恢复！
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 mc-btn bg-gray-400 text-white py-2 hover:bg-gray-500"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 mc-btn bg-red-500 text-white py-2 hover:bg-red-600"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}