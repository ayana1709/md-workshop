function ProformaTable({ formData, setFormData }) {
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] =
      field === "quantity" || field === "materialCost" || field === "laborCost"
        ? parseFloat(value) || 0
        : value;

    // Recalculate total cost
    updatedItems[index].totalCost =
      (parseFloat(updatedItems[index].materialCost) || 0) +
      (parseFloat(updatedItems[index].laborCost) || 0);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addRow = () => {
    const newItem = {
      description: "",
      quantity: 1,
      materialCost: 0,
      laborCost: 0,
      totalCost: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeRow = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-300">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-2 py-2">No.</th>
            <th className="border px-2 py-2">Description</th>
            <th className="border px-2 py-2">Quantity</th>
            <th className="border px-2 py-2">Material Cost</th>
            <th className="border px-2 py-2">Labor Cost</th>
            <th className="border px-2 py-2">Total Cost</th>
            <th className="border px-2 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="border px-2 py-2">{index + 1}</td>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="w-full px-1 py-1 border rounded"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full px-1 py-1 border rounded"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={item.materialCost}
                  onChange={(e) =>
                    handleItemChange(index, "materialCost", e.target.value)
                  }
                  className="w-full px-1 py-1 border rounded"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={item.laborCost}
                  onChange={(e) =>
                    handleItemChange(index, "laborCost", e.target.value)
                  }
                  className="w-full px-1 py-1 border rounded"
                />
              </td>
              <td className="border px-2 py-1 text-right pr-2">
                {item.totalCost.toFixed(2)}
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Row
        </button>
      </div>
    </div>
  );
}

export default ProformaTable;
