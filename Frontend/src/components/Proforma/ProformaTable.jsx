import React from "react";

// Example bilingual translation dictionary
const translations = {
  en: {
    no: "No.",
    description: "Description",
    quantity: "Quantity",
    materialCost: "Material Cost",
    laborCost: "Labor Cost",
    totalCost: "Total Cost",
    action: "Action",
    delete: "Delete",
    addRow: "Add Row",
  },
  am: {
    no: "ቁ.",
    description: "መግለጫ",
    quantity: "ብዛት",
    materialCost: "የእቃ ወጪ",
    laborCost: "የሥራ ወጪ",
    totalCost: "ጠቅላላ ወጪ",
    action: "እርምጃ",
    delete: "አስወግድ",
    addRow: "ተጨማሪ ረድፍ",
  },
};

// Simple translation function
const t = (lang, key) => translations[lang][key] || key;

function ProformaTable({ formData, setFormData, lang = "en" }) {
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = [
      "quantity",
      "materialCost",
      "laborCost",
    ].includes(field)
      ? parseFloat(value) || ""
      : value;

    updatedItems[index].totalCost =
      (parseFloat(updatedItems[index].materialCost) || 0) +
      (parseFloat(updatedItems[index].laborCost) || 0);

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addRow = () => {
    const newItem = {
      description: "",
      quantity: "",
      materialCost: "",
      laborCost: "",
      totalCost: 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeRow = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-400 text-white">
          <tr>
            {[
              "no",
              "description",
              "quantity",
              "materialCost",
              "laborCost",
              "totalCost",
              "action",
            ].map((key) => (
              <th
                key={key}
                className="border px-3 py-2 text-center font-semibold"
              >
                {t(lang, key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => (
            <tr
              key={index}
              className="text-center hover:bg-gray-50 even:bg-gray-50 transition-colors"
            >
              <td className="border px-2 py-2">{index + 1}</td>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-400"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-400 text-right no-arrows"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  value={item.materialCost}
                  onChange={(e) =>
                    handleItemChange(index, "materialCost", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-400 text-right no-arrows"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  value={item.laborCost}
                  onChange={(e) =>
                    handleItemChange(index, "laborCost", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-400 text-right no-arrows"
                />
              </td>
              <td className="border px-2 py-1 text-right font-medium text-gray-700">
                {item.totalCost.toFixed(2)}
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  {t(lang, "delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          {t(lang, "addRow")}
        </button>
      </div>

      {/* Remove arrows from number inputs */}
      <style>
        {`
          /* Chrome, Safari, Edge, Opera */
          .no-arrows::-webkit-outer-spin-button,
          .no-arrows::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          /* Firefox */
          .no-arrows[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
    </div>
  );
}

export default ProformaTable;
