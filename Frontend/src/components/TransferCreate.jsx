import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api";
import Swal from "sweetalert2";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import BackButton from "./BackButton";

const TransferCreate = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);

  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [senderName, setSenderName] = useState("");
  const [sentBy, setSentBy] = useState("");
  const [notes, setNotes] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!state?.items?.length) {
      navigate("/inventory/movement");
      return;
    }

    setItems(
      state.items.map((item) => ({
        ...item,
        transfer_qty: 1,
      })),
    );

    // Fetch branches
    api.get("/departments").then((res) => setBranches(res.data || []));
  }, []);

  const updateQty = (index, value) => {
    const updated = [...items];
    updated[index].transfer_qty = Math.max(1, value);
    setItems(updated);
  };

  const handleSend = async () => {
    if (!fromBranch || !toBranch || !senderName || !sentBy) {
      Swal.fire("Missing data", "Please fill all required fields", "warning");
      return;
    }

    const payload = {
      from_branch_id: fromBranch,
      to_branch_id: toBranch,
      sender_name: senderName,
      sent_by: sentBy,
      notes,
      items: items.map((i) => ({
        item_code: i.item_code,
        quantity: i.transfer_qty,
      })),
    };

    const confirm = await Swal.fire({
      title: "Confirm Transfer",
      text: "Stock will be recorded in movements",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Transfer",
    });

    if (!confirm.isConfirmed) return;

    try {
      // Make POST request to /api/movements
      await api.post("/movements", payload);

      Swal.fire({
        title: "Success",
        text: "Transfer recorded successfully in movements",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Navigate back to movement list
      navigate("/inventory/movement");
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text:
          err.response?.data?.message ||
          "Failed to record transfer in movements",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          <BackButton />

          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-indigo-600">
              Stock Transfer
            </h2>

            {/* Transfer Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border rounded-lg p-4 bg-gray-50">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  From Branch
                </label>
                <select
                  className="mt-1 w-full h-10 border rounded px-3 bg-white"
                  value={fromBranch}
                  onChange={(e) => setFromBranch(e.target.value)}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Destination Branch
                </label>
                <select
                  className="mt-1 w-full h-10 border rounded px-3"
                  value={toBranch}
                  onChange={(e) => setToBranch(e.target.value)}
                >
                  <option value="">Select Destination</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sender Name
                </label>
                <Input
                  className="mt-1"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter sender name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sent By
                </label>
                <Input
                  className="mt-1"
                  value={sentBy}
                  onChange={(e) => setSentBy(e.target.value)}
                  placeholder="Enter name of person sending"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <Input
                  className="mt-1"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for transfer, remarks..."
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Items to Transfer
              </h3>

              <table className="w-full border text-sm rounded overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2">Part No</th>
                    <th className="border p-2 w-32">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{item.item_name}</td>
                      <td className="border p-2 text-center">
                        {item.part_number || "—"}
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min={1}
                          value={item.transfer_qty}
                          onChange={(e) =>
                            updateQty(idx, Number(e.target.value))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button className="bg-indigo-600" onClick={handleSend}>
                Confirm Transfer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCreate;
