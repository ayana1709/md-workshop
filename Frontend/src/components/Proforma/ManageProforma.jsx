import { useEffect, useState } from "react";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function ManageProforma() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    try {
      const res = await api.get("/proforma");
      setProformas(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch proformas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This proforma will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/proforma/${id}`);
        Swal.fire("Deleted!", "Proforma deleted successfully.", "success");
        fetchProformas();
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="max-w-7xl mx-auto bg-white p-6 shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Manage Proformas</h1>
              <Link
                to="/proforma/create"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + New Proforma
              </Link>
            </div>

            {loading ? (
              <p className="text-center py-10 text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm rounded-md overflow-hidden">
                  <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                      <th className="border px-3 py-2 text-left">#</th>
                      <th className="border px-3 py-2 text-left">Date</th>
                      <th className="border px-3 py-2 text-left">Customer</th>
                      <th className="border px-3 py-2 text-left">Plate No</th>
                      <th className="border px-3 py-2 text-right">Net Total</th>
                      <th className="border px-3 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proformas.length > 0 ? (
                      proformas.map((proforma, idx) => (
                        <tr key={proforma.id} className="hover:bg-gray-50">
                          <td className="border px-3 py-2">{idx + 1}</td>
                          <td className="border px-3 py-2">{proforma.date}</td>
                          <td className="border px-3 py-2">
                            {proforma.customer_name}
                          </td>
                          <td className="border px-3 py-2">
                            {proforma.plate_no}
                          </td>
                          <td className="border px-3 py-2 text-right">
                            {Number(proforma.net_total).toFixed(2)} Birr
                          </td>
                          <td className="border px-3 py-2 text-center space-x-3">
                            <Link
                              to={`/proforma/view/${proforma.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </Link>
                            <Link
                              to={`/proforma/print/${proforma.id}`}
                              className="text-green-600 hover:underline"
                            >
                              Print
                            </Link>
                            <button
                              onClick={() => handleDelete(proforma.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-6 text-gray-500"
                        >
                          No proformas found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManageProforma;
