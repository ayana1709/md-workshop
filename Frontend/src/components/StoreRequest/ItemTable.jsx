// src/components/FormElements/ItemTable.jsx

import React, { useState, useMemo } from "react";

const ItemTable = ({ items, onUpdate, readonly }) => {
  const [nextId, setNextId] = useState(items.length > 0 ? items.length : 1);

  // --- Core Calculation Logic ---
  const { subtotal, total_vat, total_price_including_vat } = useMemo(() => {
    let sub = 0;
    let vat = 0;

    items.forEach((item) => {
      // Ensure quantity, unit_price, and vat_rate are numbers
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const rate = parseFloat(item.vat_rate) || 0;

      const itemSubtotal = qty * price;
      const itemVAT = itemSubtotal * (rate / 100);

      sub += itemSubtotal;
      vat += itemVAT;
    });

    return {
      subtotal: sub,
      total_vat: vat,
      total_price_including_vat: sub + vat,
    };
  }, [items]);

  // --- Sync with Parent Component ---
  // This useEffect ensures the parent's cost state is always up-to-date
  React.useEffect(() => {
    onUpdate(items, { subtotal, total_vat, total_price_including_vat });
  }, [items, subtotal, total_vat, total_price_including_vat]);

  // --- Handlers ---

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onUpdate(newItems, { subtotal, total_vat, total_price_including_vat });
  };

  const addItem = () => {
    const newItem = {
      id: nextId,
      item_name: "",
      quantity: 1,
      unit_price: 0,
      vat_rate: 15, // Default VAT rate
      unit: "Pcs",
    };
    onUpdate([...items, newItem], { subtotal, total_vat, total_price_including_vat });
    setNextId(prev => prev + 1);
  };

  const removeItem = (idToRemove) => {
    const newItems = items.filter((item) => item.id !== idToRemove);
    onUpdate(newItems, { subtotal, total_vat, total_price_including_vat });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Item Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
              Qty
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
              Unit
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-28">
              Unit Price
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
              VAT %
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
              Total (Excl VAT)
            </th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item, index) => (
            <tr key={item.id || index}>
              {/* Item Name */}
              <td className="p-1">
                <input
                  type="text"
                  value={item.item_name}
                  onChange={(e) =>
                    handleItemChange(index, "item_name", e.target.value)
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm p-1.5 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Engine Oil"
                />
              </td>
              {/* Quantity */}
              <td className="p-1">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm p-1.5 dark:bg-gray-700 dark:text-white"
                />
              </td>
              {/* Unit */}
              <td className="p-1">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) =>
                    handleItemChange(index, "unit", e.target.value)
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm p-1.5 dark:bg-gray-700 dark:text-white"
                />
              </td>
              {/* Unit Price */}
              <td className="p-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    handleItemChange(index, "unit_price", e.target.value)
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm p-1.5 dark:bg-gray-700 dark:text-white"
                />
              </td>
              {/* VAT Rate */}
              <td className="p-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.vat_rate}
                  onChange={(e) =>
                    handleItemChange(index, "vat_rate", e.target.value)
                  }
                  className="w-full border-gray-300 rounded-md shadow-sm p-1.5 dark:bg-gray-700 dark:text-white"
                />
              </td>
              {/* Total (Display Only) */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-medium">
                $
                {((parseFloat(item.quantity) || 0) *
                  (parseFloat(item.unit_price) || 0)).toFixed(2)}
              </td>
              {/* Remove Button */}
              <td className="p-1">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Remove Item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
                No items added yet. Click "Add Item" below.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          + Add Item
        </button>
      </div>
    </div>
  );
};

export default ItemTable;