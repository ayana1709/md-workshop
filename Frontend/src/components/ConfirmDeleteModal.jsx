import { useStores } from "../contexts/storeContext";

const ConfirmDeleteModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    handleDelete,
    selectedRepairId,
    type,
    setIsItemModalOpen,
  } = useStores();
  console.log(isModalOpen);

  console.log(selectedRepairId, type);
  // if (!isModalOpen) return null;

  return (
    <div className="h-full w-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this repair?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all duration-300"
            onClick={() => setIsItemModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300"
            onClick={() => handleDelete(selectedRepairId, type)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
