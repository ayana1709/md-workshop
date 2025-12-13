import React, { useState, useEffect, useRef } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api"; // Assuming this is your axios instance
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { TrashIcon, PhotoIcon, EyeIcon, CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

const StoreRequestForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEdit = !!id;

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRefs = useRef({});

  // Get base URL from environment or fallback
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  // Helper to construct the full public URL from the stored path
  const getPublicUrl = (path) => {
      if (!path) return null;
      // Note: This assumes the /storage/ symlink is correct relative to the base URL
      return `${baseURL.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
  };

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
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
      form.requested_items.forEach(item => {
        if (item.image_url && item.image_url.startsWith('blob:')) {
            URL.revokeObjectURL(item.image_url);
        }
      });
    };
  }, [isEdit, id]);

  const fetchRequestData = async (requestId) => {
    try {
      const response = await api.get(`/store-requests/${requestId}`); 
      const data = response.data.data || response.data;

      // **FIXED:** Generate image_url for display from stored image path
      const itemsWithUrls = (data.requested_items || []).map(item => ({
          ...item,
          // If 'image' path exists in the database, calculate the public URL for display
          image_url: item.image ? getPublicUrl(item.image) : null,
      }));

      setForm({
        ref_no: data.ref_no,
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        objective_for: data.objective_for || "",
        priority: data.priority || 3,
        requested_by: data.requested_by || "",
        requested_department: data.requested_department || "",
        // Use the array with calculated image_url
        requested_items: itemsWithUrls, 
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Failed to fetch store request data.", "error");
      // navigate("/store-request/manager"); 
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
    updatedItems[index][field] = value;
    setForm((prev) => ({ ...prev, requested_items: updatedItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      requested_items: [
        ...prev.requested_items,
        { item_name: "", unit: "pcs", quantity: 1, remark: "", image: null, image_url: null },
      ],
    }));
  };

  const removeItem = (index) => {
    const itemToRemove = form.requested_items[index];
    
    if (itemToRemove.image_url && itemToRemove.image_url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.image_url);
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
    const currentItem = form.requested_items[index];
    
    // 1. Clean up existing temporary URL before starting new upload
    if (currentItem.image_url && currentItem.image_url.startsWith('blob:')) {
        URL.revokeObjectURL(currentItem.image_url);
    }
    
    if (!file || !file.type.startsWith("image/")) {
      Swal.fire("Invalid file", "Please upload an image", "warning");
      return;
    }

    // 2. Set temporary local URL for immediate preview
    const tempPreviewUrl = URL.createObjectURL(file);
    handleItemChange(index, "image_url", tempPreviewUrl);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/store-requests/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // 3. IMPORTANT: Revoke the temporary URL
      URL.revokeObjectURL(tempPreviewUrl);

      // 4. Set the permanent path (for DB) AND the permanent URL (for frontend preview)
      handleItemChange(index, "image", response.data.path);
      handleItemChange(index, "image_url", response.data.url); // Set public URL for display state

      Swal.fire('Success', 'Image uploaded successfully.', 'success');

    } catch (err) {
      Swal.fire("Upload failed", "Image upload failed", "error");
      
      // 5. Clear state and revoke temporary URL on failure
      URL.revokeObjectURL(tempPreviewUrl);
      handleItemChange(index, "image", null);
      handleItemChange(index, "image_url", null); // Clear frontend URL on failure
      console.error(err.response?.data || err);
    }
  };

  const removeImage = (index) => {
      const item = form.requested_items[index];
      if (item.image_url && item.image_url.startsWith('blob:')) {
          URL.revokeObjectURL(item.image_url);
      }
      handleItemChange(index, "image", null);
      handleItemChange(index, "image_url", null); // Clear frontend URL
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
    
    // **CRITICAL FIX: Clean the data before submission**
    // We must remove the image_url property as it is not stored in the database.
    const cleanedItems = form.requested_items.map(item => {
        // Use object destructuring to safely exclude the image_url field
        const { image_url, ...itemToSave } = item;
        return itemToSave;
    });

    const payload = {
        ...form,
        requested_items: cleanedItems,
    };
    // -----------------------------------------------------------

    try {
      if (isEdit) {
        // Use api.put with cleaned payload
        await api.put(`/store-requests/${id}`, payload);
        Swal.fire("Updated!", "Store request updated successfully.", "success");
      } else {
        // Use api.post with cleaned payload
        await api.post("/store-requests", payload);
        Swal.fire("Success!", "Store request created successfully.", "success");
      }
      navigate("/store-request/manager");
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        Swal.fire("Validation Error", "Check the form fields. Ensure all required item fields are filled.", "error");
      } else {
        Swal.fire("Error", error.response?.data?.message || "Something went wrong.", "error");
      }
    }
  };

  // Class for standard input styling
  const inputClass = "p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500";


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
                {isEdit ? `✏️ Edit Store Request (Ref: ${form.ref_no})` : "➕ Create New Store Request"}
              </h2>
              <button
                type="button"
                onClick={() => navigate("/store-request/manager")}
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
              >
                Back to Store Requests
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* General info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-md dark:border-gray-700">
                <input 
                  type="date" 
                  name="date" 
                  value={form.date} 
                  onChange={handleChange} 
                  className={`${inputClass}`} 
                />
                <input 
                  type="text" 
                  name="requested_by" 
                  placeholder="Requested By" 
                  value={form.requested_by} 
                  onChange={handleChange} 
                  className={`${inputClass}`} 
                />
                <input 
                  type="text" 
                  name="requested_department" 
                  placeholder="Requested Department" 
                  value={form.requested_department} 
                  onChange={handleChange} 
                  className={`${inputClass}`} 
                />
                <input 
                  type="text" 
                  name="objective_for" 
                  placeholder="Objective" 
                  value={form.objective_for} 
                  onChange={handleChange} 
                  className={`${inputClass} md:col-span-2`} 
                />
                <select 
                  name="priority" 
                  value={form.priority} 
                  onChange={handleChange} 
                  className={`${inputClass}`}
                >
                  <option value={1}>1 - Urgent</option>
                  <option value={2}>2 - High</option>
                  <option value={3}>3 - Normal</option>
                </select>
              </div>
              {errors.requested_department && <p className="text-red-500 text-sm">{errors.requested_department[0]}</p>}


              {/* Items */}
              <div className="mb-4 border-t pt-4 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">📦 Items Requested</h3>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Item Name</th>
                        <th className="p-2 w-20 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Quantity</th>
                        <th className="p-2 w-20 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Unit</th>
                        <th className="p-2 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Remark</th>
                        <th className="p-2 w-32 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Image</th>
                        <th className="p-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {form.requested_items.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-800">
                          <td className="p-2">
                            <input
                              value={item.item_name || ""}
                              onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                              className={`w-full ${inputClass}`}
                            />
                            {/* Display Item Name validation errors if applicable */}
                            {errors[`requested_items.${index}.item_name`] && 
                                <p className="text-red-500 text-xs mt-1">{errors[`requested_items.${index}.item_name`][0]}</p>
                            }
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                              className={`w-full ${inputClass}`}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              value={item.unit || "pcs"}
                              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                              className={`w-full ${inputClass}`}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              value={item.remark || ""}
                              onChange={(e) => handleItemChange(index, "remark", e.target.value)}
                              className={`w-full ${inputClass}`}
                            />
                          </td>
                          
                          {/* Image Upload/Preview Cell */}
                          <td className="p-2 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => (fileInputRefs.current[index] = el)}
                              hidden
                              // Ensure file selection is handled when input changes
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                uploadImage(file, index);
                                e.target.value = null; // Clear input value so same file can be selected again
                              }}
                            />
                            {/* item.image_url now holds the calculated public URL for display */}
                            {item.image_url ? (
                              <div className="flex justify-center gap-2 items-center">
                                {/* Text color for icons adjusted for dark mode, but keeping the intent (blue/green/red) */}
                                <button type="button" title="Preview Image" onClick={() => setPreviewImage(item.image_url)}>
                                  <EyeIcon className="h-4 w-4 text-blue-500 hover:text-blue-400" />
                                </button>
                                <button type="button" title="Change Image" onClick={() => fileInputRefs.current[index]?.click()}>
                                  <CloudArrowUpIcon className="h-4 w-4 text-green-500 hover:text-green-400" />
                                </button>
                                <button type="button" title="Remove Image" onClick={() => removeImage(index)}>
                                  <TrashIcon className="h-4 w-4 text-red-600 hover:text-red-500" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button" 
                                className="text-sm text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto dark:text-gray-400 dark:hover:text-indigo-400"
                                onClick={() => fileInputRefs.current[index]?.click()}
                              >
                                <PhotoIcon className="h-4 w-4" /> Upload
                              </button>
                            )}
                          </td>
                          {/* End Image Upload/Preview Cell */}

                          <td className="p-2 text-center">
                            <button type="button" onClick={() => removeItem(index)} title="Remove Item">
                              <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800 dark:hover:text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button 
                    type="button" 
                    onClick={addItem} 
                    className="m-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Add Item
                  </button>
                </div>
                {errors.requested_items && <p className="text-red-500 text-sm mt-2">{errors.requested_items[0]}</p>}
              </div>

              {/* Submit */}
              <div className="flex justify-end mt-8">
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-lg">
                  {isEdit ? "Update Store Request" : "Submit Store Request"}
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
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreRequestForm;