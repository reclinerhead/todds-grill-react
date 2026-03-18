"use client";

import { useState, useRef } from "react";
import { uploadMenuImage, deleteMenuImage } from "@/app/actions/manager";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type MenuImage = { name: string; url: string };

export default function MenuImageManager({
  initialImages,
  isDemo = false,
}: {
  initialImages: MenuImage[];
  isDemo?: boolean;
}) {
  const [images, setImages] = useState<MenuImage[]>(initialImages);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MenuImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Extract filename from the returned URL for the name field
      const fileName = result.url.split("/").pop() ?? result.url;
      setImages((prev) => [{ name: fileName, url: result.url }, ...prev]);
      setUploadFile(null);
      setUploadPreview(null);
    }
    setUploading(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteMenuImage(deleteTarget.name);
    if ("error" in result) {
      setDeleteError(result.error);
    } else {
      setImages((prev) => prev.filter((img) => img.name !== deleteTarget.name));
      setDeleteTarget(null);
    }
    setDeleting(false);
  }

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 mb-10 max-w-xs">
        <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
          <p className="text-3xl font-extrabold text-orange-400">
            {images.length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Menu images</p>
        </div>
      </div>

      {/* Upload section — hidden in demo mode */}
      {!isDemo && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">
            Upload New Image
          </h2>
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
            className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer p-6 text-center ${
              isDragging
                ? "border-orange-500 bg-orange-500/10"
                : uploadFile
                  ? "border-white/20 bg-gray-800 cursor-default"
                  : "border-white/20 bg-gray-800 hover:border-orange-500/60 hover:bg-gray-800/80"
            }`}
          >
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

            {uploadPreview ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain shadow-lg"
                />
                <p className="text-sm text-gray-300">{uploadFile?.name}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    disabled={uploading}
                    className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                  >
                    {uploading ? "Uploading…" : "Upload Image"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFile(null);
                      setUploadPreview(null);
                      setUploadError(null);
                    }}
                    disabled={uploading}
                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <span className="text-4xl">🍔</span>
                <p className="text-white font-medium">
                  Drop an image here, or{" "}
                  <span className="text-orange-400 underline">browse</span>
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP or GIF &bull; Max 5 MB
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="mt-2 text-sm text-red-400">{uploadError}</p>
          )}
        </div>
      )}

      {/* Image grid */}
      <h2 className="text-lg font-bold text-white mb-4">Menu Images</h2>

      {images.length === 0 ? (
        <div className="rounded-xl bg-gray-800 border border-white/10 p-10 text-center">
          <p className="text-gray-400">
            No images yet. Upload the first one above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.name}
              className="group relative rounded-xl overflow-hidden border border-white/10 bg-gray-800 aspect-square"
            >
              {/* Clickable image — opens lightbox */}
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Preview image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none" />
              {!isDemo && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(img);
                    setDeleteError(null);
                  }}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg z-10"
                >
                  🗑 Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((img) => ({ src: img.url }))}
        index={lightboxIndex}
        on={{ view: ({ index: i }) => setLightboxIndex(i) }}
      />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Delete this image?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              This will permanently remove the image from storage. Any menu
              items using it will lose their image.
            </p>

            {/* Preview thumbnail */}
            <div className="mb-5 rounded-xl overflow-hidden border border-white/10 aspect-video bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deleteTarget.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {deleteError && (
              <p className="mb-3 text-sm text-red-400">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, delete it"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
