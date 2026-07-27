import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Check, Copy, Loader2, AlertCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUploadSuccess,
  folder = 'healthy_monks_products',
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Fetch Cloudinary Upload Signature from Workers Backend
      const sigRes = await fetch('/api/cloudinary/signature', { method: 'POST' });
      const sigData = await sigRes.json();

      if (!sigData.success) {
        throw new Error('Failed to obtain Cloudinary signature');
      }

      // 2. Prepare FormData for Cloudinary Upload API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder || folder);

      // 3. Upload directly to Cloudinary
      const cloudRes = await fetch(sigData.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();

      if (cloudData.secure_url) {
        setPreviewUrl(cloudData.secure_url);
        onUploadSuccess(cloudData.secure_url);
      } else {
        throw new Error(cloudData.error?.message || 'Upload to Cloudinary failed');
      }
    } catch (err: any) {
      console.error('Cloudinary Upload Error:', err);
      // Fallback preview using Object URL if offline/network issue
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      onUploadSuccess(localUrl);
      setError('Uploaded locally as fallback');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4" /> Cloudinary Media Uploader
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Cloud: hfx4iebd</span>
      </div>

      <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-300 font-semibold">Uploading to Cloudinary...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 py-1">
            <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
            <p className="text-xs font-bold text-white">Click or drag image file here</p>
            <p className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP, SVG</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {previewUrl && (
        <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <img src={previewUrl} alt="Cloudinary Preview" className="w-12 h-12 object-cover rounded-lg bg-slate-800 shrink-0" />
          
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Cloudinary URL</span>
            <p className="text-xs text-slate-300 truncate font-mono">{previewUrl}</p>
          </div>

          <button
            type="button"
            onClick={copyToClipboard}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
