'use client';

import { useRef, useState } from 'react';
import { uploadApi, resolveImageUrl } from '@/lib/api';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('图片大小不能超过 10MB'); return; }

    setUploading(true);
    try {
      const res: any = await uploadApi.image(file);
      if (res.code === 200) {
        onChange(res.data.url);
      } else {
        alert(res.message || '上传失败');
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      {value ? (
        <div className="relative inline-block">
          <img
            src={resolveImageUrl(value)}
            alt=""
            className="w-40 h-28 object-cover rounded-md"
            style={{ border: '1px solid var(--border-primary)' }}
          />
          <button
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--status-danger)' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-40 h-28 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors"
          style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.backgroundColor = 'var(--brand-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {uploading ? (
            <span className="text-sm">上传中...</span>
          ) : (
            <>
              <Upload className="w-6 h-6 mb-1" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs">点击或拖拽上传</span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/** 多图上传组件 */
interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

export function MultiImageUpload({ value = [], onChange, label, max = 10 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    const remaining = max - value.length;
    if (remaining <= 0) { alert(`最多上传 ${max} 张图片`); return; }

    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const res: any = await uploadApi.image(file);
        if (res.code === 200) newUrls.push(res.data.url);
      }
      onChange([...value, ...newUrls]);
    } catch {
      alert('部分图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative">
            <img
              src={resolveImageUrl(url)}
              alt=""
              className="w-24 h-24 object-cover rounded-md"
              style={{ border: '1px solid var(--border-primary)' }}
            />
            <button
              onClick={() => removeAt(i)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
              style={{ backgroundColor: 'var(--status-danger)' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-primary)';
              e.currentTarget.style.backgroundColor = 'var(--brand-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {uploading ? (
              <span className="text-xs">上传中</span>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs mt-0.5">添加</span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleUpload(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
