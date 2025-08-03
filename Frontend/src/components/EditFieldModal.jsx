import React, { useState } from "react";
import axios from "axios";
import api from "../api";
import { useStores } from "../contexts/storeContext";

const EditFieldModal = ({ item, field, onClose, setItems }) => {
  const [newValue, setNewValue] = useState(item[field]);

  const handleSave = async () => {
    try {
      const response = await api.patch(`/items/${item.id}/update-field`, {
        field: field,
        value: newValue,
      });

      // Extract the updated item from the response
      const updatedItem = response.data.item;

      // Update the UI instantly
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id
            ? {
                ...i,
                [field]: newValue,
                ...(field === "quantity" || field === "unit_price"
                  ? { total_price: updatedItem.total_price } // Update total price
                  : {}),
              }
            : i
        )
      );

      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  return (
    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[40%] p-5 py-10 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-green-700 tracking-wider uppercase mb-3">
          Edit {field}
        </h3>
        <p className="text-gray-700 uppercase ">
          Current {field}: {item[field]}
        </p>
        <input
          type={field === "quantity" ? "number" : "text"}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="border p-2 w-full my-3 rounded-md"
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-3 hover:bg-gray-200 px-4 rounded-md text-gray-500 hover:text-red-500 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFieldModal;
