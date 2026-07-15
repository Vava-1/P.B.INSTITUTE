import { useRef, useState, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  maxSize?: number; // max dimension in px (default 256)
  label?: string;
  className?: string;
}

/**
 * ImageUpload — file input that resizes the selected image client-side
 * (to a square crop) and converts it to a base64 JPEG data URL.
 * No external upload service needed — the data URL is stored directly in the DB.
 */
export function ImageUpload({
  value,
  onChange,
  maxSize = 256,
  label = "Photo",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    // Validate it's an image.
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB before resize).
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB. The image will be resized automatically.");
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await resizeImage(file, maxSize);
      onChange(dataUrl);
    } catch (err) {
      setError("Failed to process image. Try a different file.");
      console.error(err);
    } finally {
      setLoading(false);
      // Reset input so the same file can be selected again.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setError("");
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1">
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-[#5E17EB] hover:bg-[#5E17EB]/5 transition-colors text-gray-400 hover:text-[#5E17EB]"
            aria-label={`Upload ${label}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#5E17EB] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-[9px] mt-1">Upload</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {!value && !error && (
          <p className="text-xs text-gray-400 mt-1">Click to upload from your computer</p>
        )}
      </div>
    </div>
  );
}

// Helper: resize an image file to a square crop, return base64 JPEG data URL.
function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        // Square crop — take the center of the image.
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);

        // JPEG at 0.85 quality — good balance of size and quality for avatars.
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Re-export Label to avoid import noise in consumers.
import { Label } from "@/components/ui/label";
