import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStores } from "@/contexts/storeContext";
import api from "@/api";
import numberToWords from "number-to-words"; // npm install number-to-words

function FinalPrintAttachment() {
  const { jobId } = useParams();
  const { companyData } = useStores();
  const [payment, setPayment] = useState(null);
  console.log(payment);

  useEffect(() => {
    if (!jobId) return;
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/job/${jobId}`);
        setPayment(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        console.error("❌ Failed to fetch payment:", err);
        setPayment(null);
      }
    };
    fetchPayment();
  }, [jobId]);

  const handlePrint = () => window.print();

  if (!payment) return <p className="p-4">Loading payment details...</p>;
  // 🔹 Fallback calculation for each section
  const labourTotal =
    payment?.labourCosts?.reduce(
      (sum, row) => sum + (Number(row.total) || 0),
      0
    ) || 0;

  const spareTotal =
    payment?.spareCosts?.reduce(
      (sum, row) => sum + (Number(row.total) || 0),
      0
    ) || 0;

  const otherTotal =
    payment?.otherCosts?.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0
    ) || 0;

  // 🔹 Subtotal = sum of sections
  const calculatedSubtotal = labourTotal + spareTotal + otherTotal;

  // 🔹 VAT + Grand total
  const vatAmount = payment?.summary?.vatAmount ?? 0;
  const grandTotal =
    (payment?.summary?.grandTotal ?? calculatedSubtotal + Number(vatAmount)) ||
    0;

  // 🔹 Calculate remaining instead of relying on backend
  const remainingAmount = (
    parseFloat(payment?.summary?.grandTotal || 0) -
    parseFloat(payment?.paidAmount || 0)
  ).toFixed(2);

  return (
    <div className="p-6 bg-white text-black relative text-xs leading-tight">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="transform -rotate-45 text-[6rem] font-bold text-gray-500 opacity-10">
          Attachment
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <div className="flex items-center">
          {companyData?.logo && (
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/${
                companyData.logo
              }`}
              alt="Company Logo"
              className="h-12 w-12 object-contain mr-3"
            />
          )}
          <div>
            <h2 className="text-base font-bold text-red-600">
              {companyData?.name_am || "የኩባንያ ስም"}
            </h2>
            <h2 className="text-sm font-bold uppercase">
              {companyData?.name_en || "Company Name"}
            </h2>
          </div>
        </div>
        <div className="text-right text-xs">
          <p>📍 {companyData?.address || "----"}</p>
          <p>📞 {companyData?.phone || "----"}</p>
          {companyData?.email && <p>✉️ {companyData.email}</p>}
          {companyData?.website && <p>🌐 {companyData.website}</p>}
          <p>TIN: {companyData?.tin || "----"}</p>
          <p>VAT Reg No: {companyData?.vat || "----"}</p>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-center text-sm font-bold underline mb-4">
        PAYMENT ATTACHMENT
      </h2>

      {/* Customer Info */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p>
            <strong>Job ID:</strong> {payment.jobId}
          </p>
          <p>
            <strong>Name:</strong> {payment.name}
          </p>
          <p>
            <strong>Mobile:</strong> {payment.mobile}
          </p>
        </div>
        <div>
          {/* <p>
            <strong>Plate No:</strong> {payment.plate}
          </p> */}
          <p>
            <strong>Model:</strong> {payment.model}
          </p>
          <p>
            <strong>Received Date:</strong> {payment.receivedDate}
          </p>
        </div>
        <div>
          <p>
            <strong>Date Out:</strong> {payment.dateOut}
          </p>
        </div>
      </div>

      {[
        {
          title: "Labour Costs",
          data: payment.labourCosts,
          headers: ["Description", "Time", "Total"],
          totalKey: "total",
          fallback: payment.summary?.labourTotal,
        },
        {
          title: "Spare Parts",
          data: payment.spareCosts,
          headers: ["Item", "Part No", "Qty", "Unit Price", "Total"],
          totalKey: "total",
          fallback: payment.summary?.spareTotal,
        },
        {
          title: "Other Costs",
          data: payment.otherCosts,
          headers: ["Description", "Amount"],
          totalKey: "amount",
          fallback: payment.summary?.otherTotal,
        },
      ].map(
        (section, idx) =>
          section.data?.length > 0 && (
            <div key={idx} className="mb-4">
              <h3 className="font-semibold mb-1">{section.title}</h3>
              <table className="w-full border">
                <thead className="bg-gray-200">
                  <tr>
                    {section.headers.map((h, i) => (
                      <th key={i} className="border px-1 py-0.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((item, i) => (
                    <tr key={i}>
                      {Object.values(item).map((val, j) => (
                        <td key={j} className="border px-1 py-0.5">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Inline Total with safe calculation */}
                  <tr className="bg-gray-100 font-semibold">
                    <td
                      colSpan={section.headers.length - 1}
                      className="text-right px-1"
                    >
                      Total:
                    </td>
                    <td className="px-1">
                      {section.fallback ??
                        section.data.reduce(
                          (sum, row) =>
                            sum + (Number(row[section.totalKey]) || 0),
                          0
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 mt-4">
        <div className="italic text-xs">
          In Words:{" "}
          <span className="font-semibold">
            {numberToWords.toWords(Number(grandTotal) || 0)} birr only
          </span>
        </div>

        <div className="text-right text-xs space-y-0.5">
          <p>
            <strong>Subtotal:</strong>{" "}
            {payment?.summary?.subtotal ?? calculatedSubtotal}
          </p>
          <p>
            <strong>VAT:</strong> {vatAmount}
          </p>
          <p className="font-bold text-base">Grand Total: {grandTotal}</p>
        </div>
      </div>

      {/* Payment Info in 3 columns */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs border p-2">
        <div>
          <p>
            <strong>Payment Method:</strong> {payment.method}
          </p>
          <p>
            <strong>Status:</strong> {payment.status}
          </p>
          <p>
            <strong>Reference No:</strong> {payment.reference}
          </p>
        </div>
        <div>
          <p>
            <strong>Paid Amount:</strong> {payment.paidAmount}
          </p>
          <p>
            <strong>Remaining:</strong> {remainingAmount}
          </p>
          <p>
            <strong>Date:</strong> {payment.date}
          </p>
        </div>
        <div>
          <p>
            <strong>Paid By:</strong> {payment.paidBy}
          </p>
          <p>
            <strong>Approved By:</strong> {payment.approvedBy}
          </p>
          <p>
            <strong>Remarks:</strong> {payment.remarks}
          </p>
        </div>
      </div>

      {/* Footer with signatures */}
      <div className="flex justify-between mt-12 text-xs">
        <div className="text-center">
          <p>________________________</p>
          <p>Buyer Signature</p>
        </div>
        <div className="text-center">
          <p>________________________</p>
          <p>Seller Signature</p>
        </div>
      </div>

      {/* Print button */}
      <div className="mt-4 text-center no-print">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 text-sm"
        >
          Print Page 🖨️
        </button>
      </div>
    </div>
  );
}

export default FinalPrintAttachment;
