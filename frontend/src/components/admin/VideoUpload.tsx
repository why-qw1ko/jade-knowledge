'use client';

import { useRef, useState } from 'react';
import { uploadApi } from '@/lib/api';
import { Upload, X, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface VideoItem {
  videoUrl: string;
  coverUrl?: string;
  duration?: number;
  sort?: number;
}

interface VideoUploadProps {
  value?: VideoItem[];
  onChange: (videos: VideoItem[]) => void;
  label?: string;
  max?: number;
}

export function VideoUpload({ value = [], onChange, label, max = 5 }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) { alert('请选择视频文件'); return; }
    if (file.size > 200 * 1024 * 1024) { alert('视频大小不能超过 200MB'); return; }

    setUploading(true);
    try {
      const res: any = await uploadApi.video(file);
      if (res.code === 200) {
        const newItem: VideoItem = { videoUrl: res.data.url };
        onChange([...value, newItem]);
      } else {
        alert(res.message || '上传失败');
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const updateAt = (index: number, field: keyof VideoItem, val: string | number) => {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}

      <div className="space-y-3">
        {value.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              {item.coverUrl ? (
                <img src={item.coverUrl} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <VideoIcon className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.videoUrl}</p>
              <div className="flex gap-2">
                <Input
                  placeholder="封面图URL"
                  value={item.coverUrl || ''}
                  onChange={(e) => updateAt(i, 'coverUrl', e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="时长(秒)"
                  type="number"
                  value={item.duration?.toString() || ''}
                  onChange={(e) => updateAt(i, 'duration', Number(e.target.value))}
                  className="w-20 text-xs"
                />
              </div>
            </div>
            <button
              onClick={() => removeAt(i)}
              className="p-1"
              style={{ color: 'var(--status-danger)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {value.length < max && (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            loading={uploading}
          >
            <Upload className="w-4 h-4 mr-1" />上传视频
          </Button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>最多 {max} 个，单文件最大 200MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
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
