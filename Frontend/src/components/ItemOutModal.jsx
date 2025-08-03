import api from "../api";
import { useStores } from "../contexts/storeContext";

function ItemOutModal() {
  const {
    itemOutData,
    setItemOutData,
    setOutQuantity,
    outQuantity,
    items,
    setItems,
  } = useStores();
  console.log(itemOutData);
  const handleItemOut = async () => {
    if (outQuantity <= 0) {
      alert("Enter a valid quantity!");
      return;
    }

    if (outQuantity > itemOutData.quantity) {
      alert("Not enough stock available!");
      return;
    }

    try {
      const response = await api.post(`/items/${itemOutData.id}/item-out`, {
        quantity: outQuantity,
      });

      // Update UI instantly
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemOutData.id
            ? { ...item, quantity: item.quantity - outQuantity }
            : item
        )
      );

      setItemOutData(null); // Close modal
      setOutQuantity(0);
    } catch (error) {
      console.error("Error processing item out:", error);
    }
  };

  return (
    <div>
      {itemOutData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[40%] p-5 rounded-lg shadow-md">
            <h3 className="uppercase tracking-wider text-lg font-bold text-green-700 mb-4">
              Item Out
            </h3>
            <p className="text-gray-700 bg-green-500 bg-opacity-50 inline-block px-4 py-2 rounded-sm">
              Part Number: <strong>{itemOutData.part_number}</strong>
            </p>

            <p className="text-gray-700 bg-green-500 bg-opacity-50 inline-block px-4 py-2 ml-4 rounded-sm">
              Current Quantity: <strong>{itemOutData.quantity}</strong>
            </p>

            <label className="block mt-3">
              Enter Quantity to Be <strong>Out</strong>:
            </label>
            <input
              type="number"
              value={outQuantity}
              onChange={(e) => setOutQuantity(parseInt(e.target.value))}
              className="border p-2 w-full my-3 rounded-md"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setItemOutData(null)}
                className="mr-3 px-4 py-2 hover:bg-gray-200 hover:text-red-500 rounded transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleItemOut}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800 transition-all duration-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemOutModal;
