"use client";

import { useState, useCallback } from "react";
import MenuImagePickerModal from "./MenuImagePickerModal";
import GalleryManager from "./GalleryManager";
import ReviewManager, { type ReviewRow } from "./ReviewManager";
import {
  toggleMenuItemActive,
  toggleMenuItemFeatured,
  updateMenuItemPrice,
  updateMenuItemName,
  updateMenuItemDescription,
} from "@/app/actions/manager";

type ManagerMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
};

type GalleryImage = { name: string; url: string };

type Tab = "menu" | "reviews" | "gallery";

export default function ManagerDashboard({
  menuItems,
  galleryImages,
  reviews,
}: {
  menuItems: ManagerMenuItem[];
  galleryImages: GalleryImage[];
  reviews: ReviewRow[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [editingDescId, setEditingDescId] = useState<string | null>(null);
  const [editingDescValue, setEditingDescValue] = useState("");
  const [imagePickerItemId, setImagePickerItemId] = useState<string | null>(
    null,
  );
  const [localImageUrls, setLocalImageUrls] = useState<
    Record<string, string | null>
  >({});

  const handleImageSaved = useCallback(
    (itemId: string, newUrl: string | null) => {
      setLocalImageUrls((prev) => ({ ...prev, [itemId]: newUrl }));
      setImagePickerItemId(null);
    },
    [],
  );

  const activeCount = menuItems.filter((i) => i.is_active).length;
  const featuredCount = menuItems.filter((i) => i.is_featured).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: "menu", label: "Manage Menu" },
    { id: "reviews", label: "Manage Reviews" },
    { id: "gallery", label: "Manage Photo Gallery" },
  ];

  return (
    <>
      {/* Section nav */}
      <nav className="bg-gray-900 border-b border-white/10 px-6 flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-gray-400 hover:text-white hover:border-white/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {activeTab === "menu" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
                <p className="text-3xl font-extrabold text-white">
                  {menuItems.length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Total items</p>
              </div>
              <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
                <p className="text-3xl font-extrabold text-green-400">
                  {activeCount}
                </p>
                <p className="text-sm text-gray-400 mt-1">Active</p>
              </div>
              <div className="rounded-xl bg-gray-800 border border-white/10 p-5 text-center">
                <p className="text-3xl font-extrabold text-orange-400">
                  {featuredCount}
                </p>
                <p className="text-sm text-gray-400 mt-1">Featured</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-4">Menu Items</h2>

            {menuItems.length === 0 ? (
              <p className="text-gray-400">No menu items found.</p>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-gray-400 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium w-px">Image</th>
                      <th className="px-4 py-3 font-medium w-full">Name</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap w-px">
                        Price
                      </th>
                      <th className="px-4 py-3 font-medium text-center">
                        Active?
                      </th>
                      <th className="px-4 py-3 font-medium text-center">
                        Featured?
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {menuItems.map((item) => (
                      <tr
                        key={item.id}
                        className="bg-gray-900 hover:bg-gray-800 transition-colors"
                      >
                        {/* Image cell */}
                        <td className="px-4 py-3">
                          {(() => {
                            const imgUrl =
                              item.id in localImageUrls
                                ? localImageUrls[item.id]
                                : item.image_url;
                            return (
                              <button
                                onClick={() => setImagePickerItemId(item.id)}
                                title="Click to change image"
                                className="group relative flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-white/10 hover:border-orange-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                              >
                                {imgUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={imgUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-800 text-gray-600 text-lg">
                                    🖼
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                  Edit
                                </div>
                              </button>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          {/* Name */}
                          {editingNameId === item.id ? (
                            <form
                              action={updateMenuItemName.bind(null, item.id)}
                              onSubmit={() => setEditingNameId(null)}
                              className="flex items-center gap-1"
                            >
                              <input
                                name="name"
                                value={editingNameValue}
                                onChange={(e) =>
                                  setEditingNameValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Escape")
                                    setEditingNameId(null);
                                }}
                                autoFocus
                                className="flex-1 bg-gray-700 text-white font-medium rounded px-2 py-1 text-sm border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              />
                              <button
                                type="submit"
                                title="Save"
                                className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                title="Cancel"
                                onClick={() => setEditingNameId(null)}
                                className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingNameId(item.id);
                                setEditingNameValue(item.name);
                              }}
                              title="Click to edit name"
                              className="font-medium text-white hover:text-orange-400 transition-colors text-left w-full"
                            >
                              {item.name}
                            </button>
                          )}

                          {/* Description */}
                          {editingDescId === item.id ? (
                            <form
                              action={updateMenuItemDescription.bind(
                                null,
                                item.id,
                              )}
                              onSubmit={() => setEditingDescId(null)}
                              className="mt-1"
                            >
                              <textarea
                                name="description"
                                value={editingDescValue}
                                onChange={(e) =>
                                  setEditingDescValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Escape")
                                    setEditingDescId(null);
                                }}
                                autoFocus
                                rows={3}
                                placeholder="Add a description…"
                                className="w-full bg-gray-700 text-gray-300 rounded px-2 py-1 text-xs border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-y"
                              />
                              <div className="flex gap-1 mt-1">
                                <button
                                  type="submit"
                                  title="Save"
                                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
                                >
                                  ✓ Save
                                </button>
                                <button
                                  type="button"
                                  title="Cancel"
                                  onClick={() => setEditingDescId(null)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-white text-xs font-medium transition-colors"
                                >
                                  ✕ Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingDescId(item.id);
                                setEditingDescValue(item.description ?? "");
                              }}
                              title="Click to edit description"
                              className="text-gray-500 text-xs mt-0.5 text-left w-full hover:text-orange-400 transition-colors line-clamp-1"
                            >
                              {item.description ?? (
                                <span className="italic text-gray-600">
                                  Add description…
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                          {editingPriceId === item.id ? (
                            <form
                              action={updateMenuItemPrice.bind(null, item.id)}
                              onSubmit={() => setEditingPriceId(null)}
                              className="flex items-center gap-1"
                            >
                              <input
                                name="price"
                                value={editingPriceValue}
                                onChange={(e) =>
                                  setEditingPriceValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Escape")
                                    setEditingPriceId(null);
                                }}
                                autoFocus
                                className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              />
                              <button
                                type="submit"
                                title="Save"
                                className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                title="Cancel"
                                onClick={() => setEditingPriceId(null)}
                                className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setEditingPriceValue(item.price);
                              }}
                              title="Click to edit price"
                              className="hover:text-orange-400 hover:underline transition-colors cursor-pointer"
                            >
                              {item.price}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <form
                            action={toggleMenuItemActive.bind(
                              null,
                              item.id,
                              item.is_active,
                            )}
                          >
                            <button
                              type="submit"
                              title={item.is_active ? "Deactivate" : "Activate"}
                              className={`inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                item.is_active ? "bg-green-500" : "bg-gray-600"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                  item.is_active
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <form
                            action={toggleMenuItemFeatured.bind(
                              null,
                              item.id,
                              item.is_featured,
                            )}
                          >
                            <button
                              type="submit"
                              title={item.is_featured ? "Unfeature" : "Feature"}
                              className={`inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                item.is_featured
                                  ? "bg-orange-500"
                                  : "bg-gray-600"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                  item.is_featured
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {imagePickerItemId &&
          (() => {
            const item = menuItems.find((i) => i.id === imagePickerItemId)!;
            const currentUrl =
              imagePickerItemId in localImageUrls
                ? localImageUrls[imagePickerItemId]
                : item.image_url;
            return (
              <MenuImagePickerModal
                itemId={imagePickerItemId}
                itemName={item.name}
                currentImageUrl={currentUrl}
                onClose={() => setImagePickerItemId(null)}
                onSaved={(newUrl) =>
                  handleImageSaved(imagePickerItemId, newUrl)
                }
              />
            );
          })()}

        {activeTab === "reviews" && <ReviewManager reviews={reviews} />}

        {activeTab === "gallery" && (
          <GalleryManager initialImages={galleryImages} />
        )}
      </main>
    </>
  );
}
