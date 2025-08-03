import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { IoAdd } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";
import { FiEdit } from "react-icons/fi";

const AddStore = () => {
  const navigate = useNavigate();
  const { itemId } = useStores();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    description: "",
    part_number: "",
    quantity: "",
    brand: "",
    model: "",
    condition: "New",
    unit_price: "",
    total_price: 0,
    location: "",
  });
  console.log(item);

  const { showModal, setShowModal, setShowEditModal } = useStores();

  const handleChange = (field, value) => {
    setItem((prev) => {
      const updatedItem = { ...prev, [field]: value };

      if (field === "unit_price" || field === "quantity") {
        updatedItem[field] = value ? Number(value) : 0;
      }

      updatedItem.total_price = (
        updatedItem.unit_price * updatedItem.quantity
      ).toFixed(2);

      return updatedItem;
    });
  };

  // Fetch the list of items from the backend
  useEffect(() => {
    api
      .get(`/items/${itemId}`)
      .then((response) => {
        setItem(response.data);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });
  }, []);

  // Submit the updated data to the backend
  const handleSubmit = (event) => {
    event.preventDefault();

    api
      .put(`/items/${itemId}`, item)
      .then((response) => {
        toast.success("Item updated successfully!");

        // // Update the items list with the modified data
        // setItem((prevItems) =>
        //   prevItems.map((item) =>
        //     item.id === itemId ? response.data.item : item
        //   )
        // );
        navigate("/inventory/total-items");
        setShowEditModal(false);
        setEditingItemId(null); // Hide the dropdown after submission
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  return (
    <div className="absolute z-[999999] h-full w-full bg-black bg-opacity-60">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute z-[9999] h-[95%] w-1/2 left-[30%] top-4 -translate-x-1/2 -translate-y-1/2 p-6 px-0 bg-white shadow dark:bg-gray-600 rounded-md"
      >
        <div className="relative w-full flex gap-2 items-start border-b border-b-gray-600 pl-4">
          <FiEdit size={30} />

          <h2 className="uppercase text-xl font-bold dark:text-gray-200 text-left mb-6 uppercase tracking-wider">
            Edit Store Item
          </h2>
          <div
            onClick={() => setShowEditModal(false)}
            className="absolute right-10 border hover:border-red-700 p cursor-pointer hover:shadow-sm hover:text-red-700 transition-all duration-300"
          >
            <IoMdClose size={30} />
          </div>
        </div>

        <div className="h-[90%] flex items-center justify-center rounded-md overflow-y-auto">
          <div className="h-full p-6 rounded-lg w-[550px]">
            {/* Form Fields */}
            <div className="mt-4 space-y-3">
              {[
                { label: "Item Code", field: "code" },
                { label: "Description", field: "description" },
                { label: "Part Number", field: "part_number" },
                { label: "Brand", field: "brand" },
                { label: "Model", field: "model" },
                { label: "Location", field: "location" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm dark:text-gray-200">
                    {label}
                  </label>
                  <input
                    type="text"
                    className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border p-2 rounded-md bg-gray-50"
                    value={field === "code" ? "***" : item[field]} // Set value to "***" for "code" field
                    onChange={(e) => handleChange(field, e.target.value)}
                    disabled={field === "code"} // Disable input if field is "code"
                  />
                </div>
              ))}

              <div>
                <label className="block text-lg dark:text-gray-200 font-semibold">
                  Quantity
                </label>
                <input
                  type="number"
                  className="no-spinner w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border-[3px] p-2 rounded bg-gray-50"
                  value={item.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg dark:text-gray-200 font-semibold">
                  Unit Price
                </label>
                <input
                  type="number"
                  className="no-spinner w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border-[3px] p-2 rounded bg-gray-50"
                  value={item.unit_price}
                  onChange={(e) => handleChange("unit_price", e.target.value)}
                />
              </div>

              <div>
                <label className="block dark:text-gray-200 text-lg font-semibold">
                  Condition
                </label>
                <select
                  className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border-[3px] p-2 rounded bg-gray-50"
                  value={item.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold dark:text-gray-200">
                  Total Price
                </label>
                <input
                  type="text"
                  className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border-[3px] p-2 rounded bg-gray-50"
                  value={item.total_price}
                  disabled
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-5">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddStore;
