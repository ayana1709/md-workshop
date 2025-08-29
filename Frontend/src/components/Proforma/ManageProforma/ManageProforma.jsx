import { useEffect, useState } from "react";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import Swal from "sweetalert2";
import ProformaTable from "./ProformaTable";
import ProformaSearch from "./ProformaSearch";
import ViewProformaModal from "./modals/ViewProformaModal";
import PrintProformaModal from "./modals/PrintProformaModal";
import EditProformaModal from "./modals/EditProformaModal";

function ManageProforma() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const [selectedProforma, setSelectedProforma] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    try {
      const res = await api.get("/proformas");
      setProformas(res.data);
      setError(null);
    } catch {
      setError("Failed to fetch proformas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProformaDetails = async (jobId, type) => {
    try {
      const res = await api.get(`/proformas/${jobId}`);
      setSelectedProforma(res.data);
      if (type === "view") setViewOpen(true);
      if (type === "print") setPrintOpen(true);
      if (type === "edit") setEditOpen(true);
    } catch {
      Swal.fire("Error", "Failed to load proforma.", "error");
    }
  };

  const handleDelete = async (jobId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This proforma will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/proformas/${jobId}`);
      Swal.fire("Deleted!", "Proforma deleted successfully.", "success");
      fetchProformas();
    } catch {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="w-full bg-white p-6 shadow rounded-lg overflow-visible">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Manage Proformas</h1>
            </div>

            <ProformaSearch
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />

            <div className="overflow-x-auto relative">
              <ProformaTable
                data={proformas}
                loading={loading}
                error={error}
                globalFilter={globalFilter}
                onView={(id) => fetchProformaDetails(id, "view")}
                onPrint={(id) => fetchProformaDetails(id, "print")}
                onEdit={(id) => fetchProformaDetails(id, "edit")}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ViewProformaModal
        proforma={selectedProforma}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />
      <PrintProformaModal
        proforma={selectedProforma}
        open={printOpen}
        onClose={() => setPrintOpen(false)}
      />
      <EditProformaModal
        proforma={selectedProforma}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchProformas}
      />
    </div>
  );
}

export default ManageProforma;
