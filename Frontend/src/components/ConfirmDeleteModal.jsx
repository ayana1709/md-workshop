import { useStores } from "../contexts/storeContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✨ for animation

const ConfirmDeleteModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    handleDelete,
    selectedRepairId,
    type,
    setIsItemModalOpen,
    removeDeletedItemFromUI,
  } = useStores();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!isModalOpen) return null;

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await handleDelete(selectedRepairId, type);

      if (typeof removeDeletedItemFromUI === "function") {
        removeDeletedItemFromUI(selectedRepairId);
      }

      setIsModalOpen(false);
      setIsItemModalOpen(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 w-[90%] max-w-md rounded-2xl shadow-2xl p-6"
          >
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Confirm Deletion
            </h2>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this{" "}
              <span className="font-semibold text-red-600">repair</span>? This
              action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsItemModalOpen(false);
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow hover:bg-red-700 transition-all disabled:opacity-50"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
