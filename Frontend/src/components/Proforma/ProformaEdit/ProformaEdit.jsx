import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";
import api from "@/api";

import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

import ProformaHeader from "./ProformaHeader";
import ProformaTable from "./ProformaTable";
import ProformaFooter from "./ProformaFooter";
import ProformaPrint from "./ManageProforma/modals/ProformaPrint";

function ProformaEdit() {
  const { refNum } = useParams();
  const navigate = useNavigate();

  const printRef = useRef();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    refNum: "",
    customerName: "",
    customerTin: "",
    status: "",
    validityDate: "",
    deliveryDate: "",
    preparedBy: "",
    paymentBefore: "",
    notes: "",
  });

  const [labourRows, setLabourRows] = useState([]);
  const [spareRows, setSpareRows] = useState([]);

  const [labourVat, setLabourVat] = useState(false);
  const [spareVat, setSpareVat] = useState(false);

  const [otherCost, setOtherCost] = useState("");
  const [discount, setDiscount] = useState("");

  const [summary, setSummary] = useState({
    total: "",
    totalVat: "",
    grossTotal: "",
    netPay: "",
    netPayInWords: "",
  });

  // PRINT
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Proforma_${refNum}`,
  });

  // fetch on mount
  useEffect(() => {
    fetchProforma();
  }, []);

  const fetchProforma = async () => {
    try {
      const { data } = await api.get(`/proformas/${refNum}`);

      setFormData({
        date: data.date ?? format(new Date(), "yyyy-MM-dd"),
        refNum: data.ref_num,
        customerName: data.customer_name,
        customerTin: data.customer_tin,
        status: data.status,
        validityDate: data.validity_date,
        deliveryDate: data.delivery_date,
        preparedBy: data.prepared_by,
        paymentBefore: data.payment_before,
        notes: data.notes,
      });

      // child rows
      setLabourRows(
        data.labour_items.map((row) => ({
          description: row.description,
          unit: row.unit,
          estTime: row.est_time,
          cost: row.cost,
          total: row.total,
          remark: row.remark,
        }))
      );

      setSpareRows(
        data.spare_items.map((row) => ({
          description: row.description,
          unit: row.unit,
          brand: row.brand,
          qty: row.qty,
          unit_Price: row.unit_price,
          total: row.total,
          remark: row.remark,
        }))
      );

      setLabourVat(Boolean(data.labour_vat));
      setSpareVat(Boolean(data.spare_vat));

      setOtherCost(data.other_cost);
      setDiscount(data.discount);

      setSummary({
        total: data.total,
        totalVat: data.total_vat,
        grossTotal: data.gross_total,
        netPay: data.net_pay,
        netPayInWords: data.net_pay_in_words,
      });
    } catch (e) {
      Swal.fire("Error", "Proforma not found!", "error");
      navigate("/manage-proforma");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      ...formData,
      labourRows,
      spareRows,
      labourVat,
      spareVat,
      otherCost,
      discount,
      summary,
    };

    try {
      await api.put(`/proformas/${refNum}`, payload);

      Swal.fire({
        title: "Updated!",
        text: "Proforma updated successfully.",
        icon: "success",
      }).then(() => navigate("/manage-proforma"));
    } catch (e) {
      Swal.fire("Error", "Failed to update proforma!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />

        <main className="p-6">
          <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-semibold mb-6 text-center">
              Edit Proforma – {refNum}
            </h1>

            <div className="space-y-6">
              <ProformaHeader formData={formData} setFormData={setFormData} />

              <ProformaTable
                labourRows={labourRows}
                setLabourRows={setLabourRows}
                spareRows={spareRows}
                setSpareRows={setSpareRows}
                labourVat={labourVat}
                setLabourVat={setLabourVat}
                spareVat={spareVat}
                setSpareVat={setSpareVat}
                otherCost={otherCost}
                setOtherCost={setOtherCost}
                discount={discount}
                setDiscount={setDiscount}
                setSummary={setSummary}
              />

              <ProformaFooter formData={formData} setFormData={setFormData} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Print
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </main>

        {/* hidden print layout */}
        <div style={{ display: "none" }}>
          <ProformaPrint ref={printRef} data={formData} />
        </div>
      </div>
    </div>
  );
}

export default ProformaEdit;
