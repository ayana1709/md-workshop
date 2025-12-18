import React, { useState, useEffect, useRef } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api"; // Assuming this is your axios instance
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  TrashIcon,
  PhotoIcon,
  EyeIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import DateInput from "../DateInput";

const GoodsRequestForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRefs = useRef({});

  // Track created blob URLs so we can revoke them reliably on replace/unmount
  const blobUrlsRef = useRef(new Set());

  // Get base URL from environment or fallback
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Helper to construct the full public URL from the stored path
  const getPublicUrl = (path) => {
    if (!path) return null;
    // Note: This assumes the /storage/ symlink is correct relative to the base URL
    return `${baseURL.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
  };

  const [form, setForm] = useState({
    date: "",
    objective_for: "",
    priority: 3,
    requested_by: "",
    requested_department: "",
    requested_items: [],
  });

  // Fetch data for editing
  useEffect(() => {
    if (isEdit && id) {
      fetchRequestData(id);
    }

    // Cleanup function for object URLs on component unmount
    return () => {
      // Revoke any remaining blob URLs created during this component's lifecycle
      blobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          /* ignore */
        }
      });
      blobUrlsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const fetchRequestData = async (requestId) => {
    try {
      const response = await api.get(`/goods-requests/${requestId}`);
      const data = response.data.data || response.data;

      // Generate image_url for display from stored image path
      const itemsWithUrls = (data.requested_items || []).map((item) => ({
        ...item,
        // If 'image' path exists in the database, calculate the public URL for display
        image_url: item.image ? getPublicUrl(item.image) : null,
      }));

      setForm({
        ref_no: data.ref_no,
        date: data.date
          ? new Date(data.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        objective_for: data.objective_for || "",
        priority: data.priority || 3,
        requested_by: data.requested_by || "",
        requested_department: data.requested_department || "",
        requested_items: itemsWithUrls,
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Failed to fetch Goods Request data.", "error");
    }
  };

  // Form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.requested_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setForm((prev) => ({ ...prev, requested_items: updatedItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      requested_items: [
        ...prev.requested_items,
        {
          item_name: "",
          unit: "pcs",
          quantity: 1,
          remark: "",
          image: null,
          image_url: null,
          _tempBlob: null,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const itemToRemove = form.requested_items[index];

    if (itemToRemove?.image_url && itemToRemove.image_url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(itemToRemove.image_url);
      } catch (e) {
        /* ignore */
      }
      blobUrlsRef.current.delete(itemToRemove.image_url);
    }

    setForm((prev) => ({
      ...prev,
      requested_items: prev.requested_items.filter((_, i) => i !== index),
    }));
  };

  // ------------------------------------------------------------------
  // IMAGE HANDLER FUNCTIONS
  // ------------------------------------------------------------------

  const uploadImage = async (file, index) => {
    if (!file || !file.type.startsWith("image/")) {
      Swal.fire("Invalid file", "Please upload an image", "warning");
      return;
    }

    const tempPreviewUrl = URL.createObjectURL(file);
    // track so we can revoke on unmount or replacement
    blobUrlsRef.current.add(tempPreviewUrl);

    // 1️⃣ show preview immediately and open preview modal so user knows it worked
    setForm((prev) => {
      const items = [...prev.requested_items];
      items[index] = {
        ...items[index],
        image_url: tempPreviewUrl,
        _tempBlob: tempPreviewUrl,
      };
      return { ...prev, requested_items: items };
    });

    // show modal preview immediately (makes first-time preview obvious)
    setPreviewImage(tempPreviewUrl);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/goods-requests/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => {
        const items = [...prev.requested_items];

        // cleanup blob if it exists for this item
        const temp = items[index]?._tempBlob;
        if (temp) {
          try {
            URL.revokeObjectURL(temp);
          } catch (e) {
            /* ignore */
          }
          blobUrlsRef.current.delete(temp);
        }

        // prefer a full url from server; if server only returns path, build public url
        const serverUrl =
          res.data?.url ||
          (res.data?.path ? getPublicUrl(res.data.path) : null);

        items[index] = {
          ...items[index],
          image: res.data?.path || res.data?.image || items[index].image,
          image_url: serverUrl || items[index].image_url,
          _tempBlob: null,
        };

        // update preview modal to use server url (if provided)
        if (serverUrl) {
          setPreviewImage(serverUrl);
        }

        return { ...prev, requested_items: items };
      });
    } catch (err) {
      // revoke temp preview and remove from tracking set
      try {
        URL.revokeObjectURL(tempPreviewUrl);
      } catch (e) {
        /* ignore */
      }
      blobUrlsRef.current.delete(tempPreviewUrl);

      setForm((prev) => {
        const items = [...prev.requested_items];
        items[index] = {
          ...items[index],
          image_url: null,
          _tempBlob: null,
        };
        return { ...prev, requested_items: items };
      });

      setPreviewImage(null);

      Swal.fire("Upload failed", "Image upload failed", "error");
    }
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const items = [...prev.requested_items];

      const item = items[index];
      if (!item) return prev;

      const imageToRemove = item.image_url || item.image;

      // revoke blob
      if (imageToRemove?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imageToRemove);
        } catch {}
        blobUrlsRef.current.delete(imageToRemove);
      }

      // clear image fields
      items[index] = {
        ...item,
        image: null,
        image_url: null,
        _tempBlob: null,
      };

      // close preview safely
      if (previewImage === imageToRemove) {
        setPreviewImage(null);
      }

      return {
        ...prev,
        requested_items: items,
      };
    });
  };

  // ------------------------------------------------------------------
  // END IMAGE HANDLER FUNCTIONS
  // ------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.requested_items.length === 0) {
      Swal.fire("Missing Items", "Please add at least one item.", "warning");
      return;
    }

    // Clean the data before submission: remove frontend-only fields
    const cleanedItems = form.requested_items.map((item) => {
      const { image_url, _tempBlob, ...itemToSave } = item;
      return itemToSave;
    });

    const payload = {
      ...form,
      requested_items: cleanedItems,
    };

    try {
      if (isEdit) {
        await api.put(`/goods-requests/${id}`, payload);
        Swal.fire("Updated!", "Goods Request updated successfully.", "success");
      } else {
        await api.post("/goods-requests", payload);
        Swal.fire("Success!", "Goods Request created successfully.", "success");
      }
      navigate("/goods-request/manager");
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        Swal.fire(
          "Validation Error",
          "Check the form fields. Ensure all required item fields are filled.",
          "error"
        );
      } else {
        Swal.fire(
          "Error",
          error.response?.data?.message || "Something went wrong.",
          "error"
        );
      }
    }
  };

  // Class for standard input styling
  const inputClass =
    "p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500";

  const handleDateChange = (value) => {
    // Create a synthetic event object that mimics a regular input change
    handleChange({
      target: {
        name: "date",
        value: value,
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Card */}
          <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEdit
                  ? `✏️ Edit Goods Request (Ref: ${form.ref_no})`
                  : "➕ Create New Goods Request"}
              </h2>
              <button
                type="button"
                onClick={() => navigate("/goods-request/manager")}
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
              >
                Back to Goods Requests
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* General info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-md dark:border-gray-700">
                <div className="md:col-span-1">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Date
                  </label>
                  <DateInput
                    id="date"
                    value={form.date}
                    onChange={handleDateChange}
                    placeholder="DD/MM/YYYY"
                    className={inputClass}
                    format="DD/MM/YYYY"
                  />
                </div>

                <div>
                  <label
                    htmlFor="requested_by"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Requested By
                  </label>
                  <input
                    id="requested_by"
                    type="text"
                    name="requested_by"
                    placeholder="e.g. John Doe"
                    value={form.requested_by}
                    onChange={handleChange}
                    className={`${inputClass} w-full`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="requested_department"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Requested Department
                  </label>
                  <input
                    id="requested_department"
                    type="text"
                    name="requested_department"
                    placeholder="e.g. Purchasing"
                    value={form.requested_department}
                    onChange={handleChange}
                    className={`${inputClass} w-full`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="objective_for"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Objective / Purpose
                  </label>
                  <input
                    id="objective_for"
                    type="text"
                    name="objective_for"
                    placeholder="Briefly describe the objective (e.g. Office supplies for Q1)"
                    value={form.objective_for}
                    onChange={handleChange}
                    className={`${inputClass} w-full`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className={`${inputClass} w-full`}
                  >
                    <option value={1}>1 - Urgent</option>
                    <option value={2}>2 - High</option>
                    <option value={3}>3 - Normal</option>
                  </select>
                </div>
              </div>
              {errors.requested_department && (
                <p className="text-red-500 text-sm">
                  {errors.requested_department[0]}
                </p>
              )}

              {/* Items */}
              <div className="mb-4 border-t pt-4 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  📦 Items Requested
                </h3>

                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                  {/* Desktop/Large Table */}
                  <div className="hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Item Name
                          </th>
                          <th className="p-2 md:p-3 w-20 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Unit
                          </th>
                          <th className="p-2 md:p-3 w-24 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Quantity
                          </th>
                          <th className="p-2 md:p-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Remark
                          </th>
                          <th className="p-2 md:p-3 w-32 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Image
                          </th>
                          <th className="p-2 md:p-3 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {form.requested_items.map((item, index) => {
                          const itemNameId = `item_name_${index}`;
                          const qtyId = `quantity_${index}`;
                          const unitId = `unit_${index}`;
                          const remarkId = `remark_${index}`;
                          const fileInputId = `file_input_${index}`;

                          return (
                            <tr
                              key={index}
                              className="bg-white dark:bg-gray-800"
                            >
                              <td className="p-2 md:p-3">
                                <label htmlFor={itemNameId} className="sr-only">
                                  Item name
                                </label>
                                <input
                                  id={itemNameId}
                                  value={item.item_name || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "item_name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Item name"
                                  className={`w-full ${inputClass}`}
                                />
                                {errors[
                                  `requested_items.${index}.item_name`
                                ] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {
                                      errors[
                                        `requested_items.${index}.item_name`
                                      ][0]
                                    }
                                  </p>
                                )}
                              </td>
                              <td className="p-2 md:p-3">
                                <label htmlFor={unitId} className="sr-only">
                                  Unit
                                </label>
                                <input
                                  id={unitId}
                                  value={item.unit || "pcs"}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full ${inputClass}`}
                                  placeholder="pcs"
                                />
                              </td>
                              <td className="p-2 md:p-3">
                                <label htmlFor={qtyId} className="sr-only">
                                  Quantity
                                </label>

                                <input
                                  id={qtyId}
                                  type="text"
                                  value={item.quantity || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    // Only digits allowed (any length)
                                    if (/^\d*$/.test(val)) {
                                      handleItemChange(
                                        index,
                                        "quantity",
                                        val ? Number(val) : ""
                                      );
                                    }
                                  }}
                                  className={`w-full ${inputClass}`}
                                />
                              </td>
                              <td className="p-2 md:p-3">
                                <label htmlFor={remarkId} className="sr-only">
                                  Remark
                                </label>
                                <input
                                  id={remarkId}
                                  value={item.remark || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "remark",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full ${inputClass}`}
                                  placeholder="Optional note"
                                />
                              </td>

                              {/* Image Upload/Preview Cell */}
                              <td className="p-2 md:p-3 text-center">
                                <input
                                  id={fileInputId}
                                  type="file"
                                  accept="image/*"
                                  ref={(el) =>
                                    (fileInputRefs.current[index] = el)
                                  }
                                  hidden
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    uploadImage(file, index);
                                    e.target.value = null;
                                  }}
                                />
                                {item.image_url ? (
                                  <div className="relative flex justify-center">
                                    <img
                                      src={item.image_url}
                                      alt={`Item ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded cursor-pointer border hover:opacity-80"
                                      onClick={() =>
                                        setPreviewImage(item.image_url)
                                      }
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                      title="Remove Image"
                                    >
                                      <XMarkIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="text-sm text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto"
                                    onClick={() =>
                                      fileInputRefs.current[index]?.click()
                                    }
                                  >
                                    <PhotoIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                      Upload
                                    </span>
                                  </button>
                                )}
                              </td>
                              {/* End Image Upload/Preview Cell */}

                              <td className="p-2 md:p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  title="Remove Item"
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800 dark:hover:text-red-500" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Cards View */}
                  <div className="block lg:hidden">
                    {form.requested_items.map((item, index) => {
                      const itemNameId = `mobile_item_name_${index}`;
                      const qtyId = `mobile_quantity_${index}`;
                      const unitId = `mobile_unit_${index}`;
                      const remarkId = `mobile_remark_${index}`;
                      const fileInputId = `mobile_file_input_${index}`;

                      return (
                        <div
                          key={`mobile-${index}`}
                          className="border-b dark:border-gray-700 p-4 last:border-b-0"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <label
                                htmlFor={itemNameId}
                                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                              >
                                Item Name
                              </label>
                              <input
                                id={itemNameId}
                                value={item.item_name || ""}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "item_name",
                                    e.target.value
                                  )
                                }
                                placeholder="Item name (e.g. Ballpoint pen)"
                                className={`w-full ${inputClass} mb-1`}
                              />
                              {errors[`requested_items.${index}.item_name`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    errors[
                                      `requested_items.${index}.item_name`
                                    ][0]
                                  }
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              title="Remove Item"
                              className="ml-2 p-2"
                            >
                              <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800 dark:hover:text-red-500" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label
                                htmlFor={unitId}
                                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                              >
                                Unit
                              </label>
                              <input
                                id={unitId}
                                value={item.unit || "pcs"}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                className={`w-full ${inputClass}`}
                                placeholder="pcs"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={qtyId}
                                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                              >
                                Quantity
                              </label>
                              <input
                                id={qtyId}
                                type="text"
                                value={item.quantity || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // Only digits allowed (any length)
                                  if (/^\d*$/.test(val)) {
                                    handleItemChange(
                                      index,
                                      "quantity",
                                      val ? Number(val) : ""
                                    );
                                  }
                                }}
                                className={`w-full ${inputClass}`}
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor={remarkId}
                              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                            >
                              Remark
                            </label>
                            <input
                              id={remarkId}
                              value={item.remark || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "remark",
                                  e.target.value
                                )
                              }
                              className={`w-full ${inputClass}`}
                              placeholder="Optional note"
                            />
                          </div>

                          {/* Image Upload/Preview - Mobile */}
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Image
                            </label>
                            <div>
                              <input
                                id={fileInputId}
                                type="file"
                                accept="image/*"
                                ref={(el) =>
                                  (fileInputRefs.current[index] = el)
                                }
                                hidden
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  uploadImage(file, index);
                                  e.target.value = null;
                                }}
                              />
                              {item.image_url ? (
                                <div className="relative">
                                  <img
                                    src={item.image_url}
                                    alt={`Item ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded cursor-pointer border hover:opacity-80"
                                    onClick={() =>
                                      setPreviewImage(item.image_url)
                                    }
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    title="Remove Image"
                                  >
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                                  onClick={() =>
                                    fileInputRefs.current[index]?.click()
                                  }
                                >
                                  <PhotoIcon className="h-4 w-4" />
                                  Upload
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full sm:w-auto text-center"
                    >
                      Add Item
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                      Tip: Click "Upload" to add an image. The preview will
                      appear immediately, and you can click the thumbnail to
                      enlarge.
                    </p>
                  </div>
                </div>

                {errors.requested_items && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.requested_items[0]}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-lg"
                >
                  {isEdit ? "Update Goods Request" : "Submit Goods Request"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Image Preview Modal (z-50 is good for fixed/modal overlays) */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Item Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white p-2 bg-gray-700/50 rounded-full hover:bg-gray-700"
            aria-label="Close image preview"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GoodsRequestForm;
