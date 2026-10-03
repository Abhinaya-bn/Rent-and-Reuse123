import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_IMAGE } from '@/lib/images';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface UploadedImage {
  url: string;
  path: string;
}

interface ImageUploaderProps {
  uploadedImages: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  onError: (message: string) => void;
}

export function ImageUploader({ uploadedImages, onImagesChange, onError }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name} is not a supported format. Please use JPG, PNG, or WEBP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is too large. Maximum file size is 5MB.`;
    }
    return null;
  };

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (uploadedImages.length + fileArray.length > MAX_IMAGES) {
      onError(`You can upload a maximum of ${MAX_IMAGES} images per item.`);
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        onError(validationError);
        return;
      }
    }

    setUploading(true);
    try {
      const newImages: UploadedImage[] = [];
      for (const file of fileArray) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);

        newImages.push({ url: urlData.publicUrl, path: filePath });
      }
      onImagesChange([...uploadedImages, ...newImages]);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, onImagesChange, onError]);

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    try {
      await supabase.storage.from('item-images').remove([imageToRemove.path]);
    } catch {
      // Even if removal fails, remove from UI so the user isn't stuck
    }
    onImagesChange(uploadedImages.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const remaining = MAX_IMAGES - uploadedImages.length;

  return (
    <div>
      <label className="block text-sm font-medium text-chocolate-700 mb-1.5">
        Item Photos <span className="text-chocolate-400 font-normal">(up to {MAX_IMAGES})</span>
      </label>

      {/* Upload area */}
      {remaining > 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-chocolate-400 bg-chocolate-50 scale-[1.01]'
              : 'border-sand-300 bg-white hover:border-chocolate-300 hover:bg-sand-50'
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 text-chocolate-500 animate-spin" />
              <p className="text-sm text-chocolate-500">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sand-200 text-chocolate-600">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-chocolate-700">
                Tap to upload or drag & drop
              </p>
              <p className="text-xs text-chocolate-400">
                JPG, PNG, or WEBP — max 5MB each
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      {/* Preview thumbnails */}
      {uploadedImages.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {uploadedImages.map((img, i) => (
            <div
              key={img.path}
              className="relative group aspect-square rounded-lg overflow-hidden border border-sand-200 bg-sand-100"
            >
              <img
                src={img.url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 p-1 rounded-full bg-white/90 backdrop-blur-sm text-red-500 hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-chocolate-800/80 text-cream text-[10px] font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state hint */}
      {uploadedImages.length === 0 && !uploading && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-chocolate-400">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>No photos selected yet. A placeholder will be used if none are uploaded.</span>
        </div>
      )}

      {/* Count indicator */}
      {uploadedImages.length > 0 && (
        <p className="mt-2 text-xs text-chocolate-400">
          {uploadedImages.length} of {MAX_IMAGES} photos{remaining > 0 ? ` — ${remaining} remaining` : ' (max reached)'}
        </p>
      )}
    </div>
  );
}

export type { UploadedImage };
