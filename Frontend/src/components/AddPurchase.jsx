import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AddPurchase = () => {
  const navigate = useNavigate();
  const [purchaseDetails, setPurchaseDetails] = useState({
    purchaseDate: "",
    purchasedBy: "",
    receivedBy: "",
    paymentMethod: "Cash",
    paymentStatus: "Pending",
  });

  // console.log(purchaseDetails);

  const [items, setItems] = useState([
    {
      id: uuidv4(),
      code: "", // Ensure a default code value
      item_name: "",
      partNumber: "",
      quantity: null,
      brand: "",
      model: "",
      condition: "New",
      unitPrice: null,
      totalPrice: 0.0,
      location: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const addRow = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: uuidv4(),
        code: "", // Generate a unique code
        item_name: "",
        partNumber: "",
        quantity: null,
        brand: "",
        model: "",
        condition: "New",
        unitPrice: null,
        totalPrice: 0.0,
        location: "",
      },
    ]);
  };

  const handleChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };

          // Ensure numeric values for unitPrice and quantity
          if (field === "unitPrice" || field === "quantity") {
            updatedItem[field] = value ? Number(value) : 0;
          }

          // Calculate totalPrice as a number
          updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity;

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handlePurchaseDetailsChange = (e) => {
    const { name, value } = e.target;
    setPurchaseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const deleteRow = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = excelData.map((row) => ({
        id: uuidv4(),
        code: row.Code ? String(row.Code) : "", // Ensure code is a string
        description: row.Description ? String(row.Description) : "",
        partNumber: row["PartNumber"] ? String(row["PartNumber"]) : "", // Ensure partNumber is always a string
        quantity: row["Quantity"] ? Number(row["Quantity"]) : null,
        brand: row.Brand ? String(row.Brand) : "",
        model: row.Model ? String(row.Model) : "",
        condition: row.Condition ? String(row.Condition) : "New",
        unitPrice: row["UnitPrice"] ? Number(row["UnitPrice"]) : null,
        totalPrice: (
          (row["UnitPrice"] ? Number(row["UnitPrice"]) : 0) *
          (row["Quantity"] ? Number(row["Quantity"]) : 0)
        ).toFixed(2),
        location: row.Location ? String(row.Location) : "",
      }));

      setItems(formattedData);
      toast.success("Excel data imported successfully!");
    };

    reader.onerror = () => {
      toast.error("Error importing file!");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Merge purchase details into each item in the array
    const payload = items.map((item) => ({
      ...item,
      ...purchaseDetails, // Adds purchase details to each item
    }));
    console.log(payload);

    api
      .post("/purchases", payload)
      .then((response) => {
        alert("Purchase saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving purchase:", error);
      });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-md">
      <h2 className="text-2xl font-bold dark:text-gray-200 text-left mb-6 uppercase tracking-wider">
        Add Store Items
      </h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Add Item
        </button>
        <label className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer">
          Import Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      <div className="overflow-x-auto phone:mt-20 tablet:mt-0 overflow-hidden">
        <div className="bg-gray-800 border border-gray-400 text-white rounded-md shadow-md px-4 py-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Purchase Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">Purchase Date:</label>
              <input
                type="date"
                name="purchaseDate"
                value={purchaseDetails.purchaseDate}
                onChange={handlePurchaseDetailsChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Purchased By:</label>
              <input
                type="text"
                name="purchasedBy"
                value={purchaseDetails.purchasedBy}
                onChange={handlePurchaseDetailsChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm">Received By:</label>
              <input
                type="text"
                name="receivedBy"
                value={purchaseDetails.receivedBy}
                onChange={handlePurchaseDetailsChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
              />
            </div>
            {/* <div>
              <label className="block text-sm">Condition:</label>
              <select
                name="condition"
                value={purchaseDetails.condition}
                onChange={handlePurchaseDetailsChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div> */}
            <div>
              <label className="block text-sm">Payment Method:</label>
              <select
                name="paymentMethod"
                value={purchaseDetails.paymentMethod}
                onChange={handlePurchaseDetailsChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Payment Status:</label>
              <select
                name="paymentStatus"
                value={purchaseDetails.paymentStatus}
                onChange={handlePurchaseDetailsChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <table className="w-full border border-table-border rounded-t-lg shadow-md">
          <thead className="bg-table-head border border-table-border text-white text-sm">
            <tr>
              {[
                "#",
                "Code",
                "Item name",
                "Part Number",
                "Quantity",
                "Brand",
                "Model",
                "Unit Price",
                "Total Price",
                "Location",
                "Condition",
                "Actions",
              ].map((header) => (
                <th key={header} className="border border-table-border p-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={row.id}>
                <td className="border dark:text-gray-200 border-table-border p-2 text-center">
                  {index + 1}
                </td>
                {Object.keys(row).map((field) => {
                  if (field === "id" || field === "condition") return null; // Skip "id" and "condition" fields

                  return (
                    <td key={field} className="border border-table-border p-2">
                      <input
                        type={
                          field === "unitPrice" || field === "quantity"
                            ? "number"
                            : "text"
                        }
                        value={row[field]}
                        onChange={(e) =>
                          handleChange(row.id, field, e.target.value)
                        }
                        className="dark:bg-gray-800 placeholder:dark:text-white dark:text-white no-spinner w-full border p-1 rounded"
                      />
                    </td>
                  );
                })}

                {/* Render "condition" separately as a dropdown */}
                <td className="border border-table-border p-2">
                  <select
                    value={row.condition}
                    onChange={(e) =>
                      handleChange(row.id, "condition", e.target.value)
                    }
                    className="dark:bg-gray-800 placeholder:dark:text-white dark:text-white w-full border p-1 rounded"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </td>

                <td className="border border-table-border p-2">
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

export default AddPurchase;
