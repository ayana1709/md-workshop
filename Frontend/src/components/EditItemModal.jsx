import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useState } from "react";
import api from "@/api";
import { Row } from "jspdf-autotable";
import { toast } from "react-toastify";

const EditItemModal = ({ open, setOpen, item, onSave }) => {
  const [formData, setFormData] = useState({
    item_name: item.item_name || "",
    part_number: item.part_number || "",
    condition: item.condition || "",
    description: item.description || "",
    brand: item.brand || "",
    model: item.model || "",
    category: item.category || "",
    quantity: item.quantity || "",
    unit: item.unit || "",
    manufacturer: item.manufacturer || "",
    manufacturing_date: item.manufacturing_date || "",
    created_at: item.created_at || "",
    location: item.location || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  // Submit the updated data to the backend
  const handleSubmit = (e, id) => {
    e.preventDefault();

    api
      .put(`/items/${id}`, formData)
      .then((response) => {
        toast.success("Item updated successfully!");

        onSave(formData);
        setOpen(false);
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white p-0 rounded-md shadow-md w-[40%] max-h-[90vh] overflow-y-auto">
        <div className="border-b p-3 flex items-center gap-2">
          <h2>Edit Item</h2>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-col gap-4">
            {[
              { label: "Item Name:", key: "item_name" },
              { label: "Part Number:", key: "part_number" },
              {
                label: "Description:",
                key: "description",
                type: "textarea",
              },
              { label: "Quantity:", key: "quantity" },
              { label: "Brand:", key: "brand" },
              { label: "Model:", key: "model" },
              { label: "Condition:", key: "condition" },
              { label: "Unit:", key: "unit" },
              { label: "Manufacturer:", key: "manufacturer" },
              { label: "Manufacturing Date:", key: "manufacturing_date" },
              {
                label: "Location:",
                key: "location",
              },
            ].map((field, index) => (
              <div key={index} className="flex items-start gap-2">
                <label className="w-40 text-right text-sm font-medium pt-1">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 px-2 py-1 rounded-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 px-2 py-1 rounded-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded-sm"
            >
              Cancel
            </Button>
            <Button onClick={(e) => handleSubmit(e, item.id)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemModal;
