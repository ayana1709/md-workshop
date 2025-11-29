import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useState } from "react";
import api from "@/api";
import { toast } from "react-toastify";
import { useStores } from "@/contexts/storeContext";
// import { useStores } from "../contexts/storeContext";

const EditItemModal = ({ open, setOpen, item }) => {
  const { fetchItems } = useStores(); // <-- get fetchItems from context

  const [formData, setFormData] = useState({
    code: item.code || "",
    part_number: item.part_number || "",
    item_name: item.item_name || "",
    quantity: item.quantity || "",
    brand: item.brand || "",
    // model: item.model || "",
    condition: item.condition || "",
    unit: item.unit || "",
    purchase_price: item.purchase_price || "",
    selling_price: item.selling_price || "",
    least_price: item.least_price || "",
    maximum_price: item.maximum_price || "",
    // minimum_quantity: item.minimum_quantity || "",
    low_quantity: item.low_quantity || "",
    manufacturer: item.manufacturer || "",
    // manufacturing_date: item.manufacturing_date || "",
    // unit_price: item.unit_price || "",
    total_price: item.total_price || "",
    location: item.location || "",
    image: null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    try {
      await api.post(`/items/${item.id}?_method=PUT`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item updated successfully!");
      await fetchItems(); // <-- refresh list in context
      setOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const fields = [
    { label: "Item Name:", key: "item_name" },
    { label: "Part Number:", key: "part_number" },
    { label: "Brand:", key: "brand" },
    { label: "Unit:", key: "unit" },
    { label: "Purchase Price:", key: "purchase_price", type: "number" },
    { label: "Selling Price:", key: "selling_price", type: "number" },
    { label: "Quantity:", key: "quantity", type: "number" },
    { label: "Location:", key: "location" },
    { label: "Least Price:", key: "least_price", type: "number" },
    { label: "Maximum Price:", key: "maximum_price", type: "number" },
    { label: "Low Quantity:", key: "low_quantity", type: "number" },
    { label: "Manufacturer:", key: "manufacturer" },
    { label: "Total Price:", key: "total_price", type: "number" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white p-0 rounded-lg shadow-lg w-full max-w-2xl sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Edit Item</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6">
          <div className="flex flex-col gap-5">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <label className="sm:w-40 text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={formData[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="flex-1 text-sm border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {/* Image Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="sm:w-40 text-sm font-medium text-gray-700">
                Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemModal;
