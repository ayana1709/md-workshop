import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useState } from "react";
import api from "@/api";
import { toast } from "react-toastify";

const EditItemModal = ({ open, setOpen, item, onSave }) => {
  const [formData, setFormData] = useState({
    code: item.code || "",
    part_number: item.part_number || "",
    item_name: item.item_name || "",
    quantity: item.quantity || "",
    brand: item.brand || "",
    model: item.model || "",
    condition: item.condition || "",
    unit: item.unit || "",
    purchase_price: item.purchase_price || "",
    selling_price: item.selling_price || "",
    least_price: item.least_price || "",
    maximum_price: item.maximum_price || "",
    minimum_quantity: item.minimum_quantity || "",
    low_quantity: item.low_quantity || "",
    manufacturer: item.manufacturer || "",
    manufacturing_date: item.manufacturing_date || "",
    unit_price: item.unit_price || "",
    total_price: item.total_price || "",
    location: item.location || "",
    image: null, // file upload
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    api
      .post(`/items/${item.id}?_method=PUT`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        toast.success("Item updated successfully!");
        onSave(response.data.item);
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error updating item:", error);
        toast.error("Failed to update item");
      });
  };

  const fields = [
    { label: "Item Name:", key: "item_name" },
    { label: "Part Number:", key: "part_number" },
    { label: "Quantity:", key: "quantity", type: "number" },
    { label: "Brand:", key: "brand" },
    { label: "Model:", key: "model" },
    {
      label: "Condition:",
      key: "condition",
      type: "select",
      options: ["New", "Used"],
    },
    { label: "Unit:", key: "unit" },
    { label: "Purchase Price:", key: "purchase_price", type: "number" },
    { label: "Selling Price:", key: "selling_price", type: "number" },
    { label: "Least Price:", key: "least_price", type: "number" },
    { label: "Maximum Price:", key: "maximum_price", type: "number" },
    { label: "Minimum Quantity:", key: "minimum_quantity", type: "number" },
    { label: "Low Quantity:", key: "low_quantity", type: "number" },
    { label: "Manufacturer:", key: "manufacturer" },
    { label: "Manufacturing Date:", key: "manufacturing_date", type: "date" },
    { label: "Unit Price:", key: "unit_price", type: "number" },
    { label: "Total Price:", key: "total_price", type: "number" },
    { label: "Location:", key: "location" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white p-0 rounded-md shadow-md w-[40%] max-h-[90vh] overflow-y-auto">
        <div className="border-b p-3 flex items-center gap-2">
          <h2>Edit Item</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <div key={index} className="flex items-start gap-2">
                <label className="w-40 text-right text-sm font-medium pt-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 px-2 py-1 rounded-sm"
                  >
                    <option value="">Select</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 px-2 py-1 rounded-sm"
                  />
                )}
              </div>
            ))}

            <div className="flex items-start gap-2">
              <label className="w-40 text-right text-sm font-medium pt-1">
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

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded-sm"
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemModal;
