import React from "react";
import api from "@/api";
import Swal from "sweetalert2";

function EditProformaModal({ proforma, open, onClose, onUpdated }) {
  const [formData, setFormData] = React.useState(proforma || {});

  React.useEffect(() => {
    if (proforma) setFormData(proforma);
  }, [proforma]);

  if (!open || !formData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/proforma/${formData.id}`, formData);
      Swal.fire("Updated!", "Proforma updated successfully.", "success");
      onUpdated();
      onClose();
    } catch (err) {
      Swal.fire("Error", "Update failed!", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-3/4 max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Proforma #{formData.id}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div>
            <label>Customer Name</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>Product Name</label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>Ref Num</label>
            <input
              type="text"
              value={formData.ref_num}
              onChange={(e) =>
                setFormData({ ...formData, ref_num: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProformaModal;
