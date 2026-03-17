"use client";

import { useState, useEffect, useRef } from "react";
import {
  listMenuImages,
  uploadMenuImage,
  updateMenuItemImage,
} from "@/app/actions/manager";

type BucketImage = { name: string; url: string };

type Props = {
  itemId: string;
  itemName: string;
  currentImageUrl: string | null;
  onClose: () => void;
  onSaved: (newUrl: string | null) => void;
};

export default function MenuImagePickerModal({
  itemId,
  itemName,
  currentImageUrl,
  onClose,
  onSaved,
}: Props) {
  const [images, setImages] = useState<BucketImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    currentImageUrl,
  );
  const [saving, setSaving] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMenuImages().then((imgs) => {
      setImages(imgs);
      setLoadingImages(false);
    });
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5 MB.");
      return;
    }
    setUploadFile(file);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", uploadFile);
    const result = await uploadMenuImage(fd);
    if ("error" in result) {
      setUploadError(result.error);
    } else {
      const newImg: BucketImage = { name: uploadFile.name, url: result.url };
      setImages((prev) => [newImg, ...prev]);
      setSelectedUrl(result.url);
      setUploadFile(null);
      setUploadPreview(null);
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    await updateMenuItemImage(itemId, selectedUrl);
    onSaved(selectedUrl);
    setSaving(false);
  }

  const hasChanged = selectedUrl !== currentImageUrl;

  return (
    // Backdrop — click outside to dismiss
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-[720px] max-h-[82vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Select Image</h2>
            <p className="text-sm text-gray-400 mt-0.5">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-lg leading-none mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* Bucket images grid */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Available in Bucket
            </h3>
            {loadingImages ? (
              <p className="text-sm text-gray-500">Loading images…</p>
            ) : images.length === 0 ? (
              <p className="text-sm text-gray-500">
                No images found in the bucket.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img) => {
                  const isSelected = selectedUrl === img.url;
                  return (
                    <button
                      key={img.name}
                      onClick={() =>
                        setSelectedUrl(isSelected ? currentImageUrl : img.url)
                      }
                      title={img.name}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                        isSelected
                          ? "border-orange-500 shadow-lg shadow-orange-500/20"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Selection overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-orange-500/15 flex items-start justify-end p-1.5">
                          <span className="bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold leading-none">
                            ✓
                          </span>
                        </div>
                      )}
                      {/* Filename tooltip */}
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-xs text-gray-300 px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {img.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedUrl && (
              <button
                onClick={() => setSelectedUrl(null)}
                className="mt-3 text-xs text-gray-600 hover:text-red-400 transition-colors"
              >
                ✕ Remove image from this item
              </button>
            )}
          </section>

          {/* Upload new image */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Upload New Image
            </h3>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => !uploadFile && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 transition-colors ${
                uploadFile
                  ? "border-white/20 cursor-default"
                  : isDragging
                    ? "border-orange-400 bg-orange-500/10 cursor-copy"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer"
              }`}
            >
              {uploadPreview && uploadFile ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadPreview}
                    alt="preview"
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                        setUploadPreview(null);
                        setUploadError(null);
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center select-none">
                  <div className="text-3xl mb-2 opacity-50">🖼</div>
                  <p className="text-sm text-gray-400">
                    Drag & drop or{" "}
                    <span className="text-orange-400 underline">
                      choose a file
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    JPG, PNG, WEBP · max 5 MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = "";
                }}
              />
            </div>

            {uploadError && (
              <p className="text-xs text-red-400 mt-2">{uploadError}</p>
            )}

            {uploadFile && !uploading && (
              <button
                onClick={handleUpload}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                ↑ Upload to Bucket
              </button>
            )}
            {uploading && (
              <p className="text-sm text-gray-400 mt-3 animate-pulse">
                Uploading…
              </p>
            )}
          </section>
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0">
          {/* Preview of current selection */}
          <div className="flex items-center gap-2.5">
            {selectedUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedUrl}
                  alt=""
                  className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20"
                />
                <span className="text-xs text-gray-400">
                  {hasChanged ? "New selection" : "Current image"}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-500">No image selected</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanged || saving}
              className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
