import React, { useState } from "react";
import api from "../api";

const EditFieldModal = ({ item, field, onClose, setItems }) => {
  const [newValue, setNewValue] = useState(item[field]);

  const handleSave = async () => {
    try {
      const response = await api.patch(`/items/${item.id}/update-field`, {
        field,
        value: newValue,
      });

      const updatedItem = response.data.item;

      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id
            ? {
                ...i,
                [field]: newValue,
                ...(field === "quantity" || field === "purchase_price"
                  ? { total_price: updatedItem.total_price }
                  : {}),
              }
            : i
        )
      );

      onClose();
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Failed to update. Please check the value and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-md sm:max-w-lg md:max-w-xl p-6 rounded-lg shadow-lg relative">
        <h3 className="text-lg md:text-xl font-bold text-green-700 uppercase mb-3">
          Edit {field}
        </h3>
        <p className="text-gray-700 uppercase mb-3">
          Current {field}: {item[field]}
        </p>
        <input
          type={field === "quantity" ? "number" : "text"}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="border p-2 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-red-500 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFieldModal;
