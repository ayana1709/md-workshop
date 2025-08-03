import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PrintAttachemnt from "./printAttachemnt";
import api from "@/api";

function FinalPrintAttachment() {
  const { jobId } = useParams();
  // const jobId = rawJobId ? rawJobId.replace(/^0+/, "") : null;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;

    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/by-job/${jobId}`);
        if (!res.data) throw new Error("No data returned");
        setPayment(res.data);
      } catch (err) {
        setError("Failed to load payment data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [jobId]);

  if (!jobId) return <p className="text-red-500 text-center">Invalid Job ID</p>;

  return (
    <div className="flex justify-center items-start bg-white dark:bg-gray-900 p-6 min-h-screen overflow-y-auto">
      <div className="w-full max-w-5xl space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <PrintAttachemnt jobId={jobId} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-800 dark:text-gray-200">
                <div>
                  <strong>Payment Method:</strong> {payment.payment_method}
                </div>
                <div>
                  <strong>Status:</strong> {payment.payment_status}
                </div>
                <div>
                  <strong>Paid:</strong> {payment.paid_amount} ETB
                </div>
                <div>
                  <strong>Remaining:</strong> {payment.remaining_amount} ETB
                </div>
                <div>
                  <strong>Ref No:</strong> {payment.ref_no}
                </div>
                <div>
                  <strong>Date:</strong> {payment.payment_date}
                </div>
                <div>
                  <strong>Paid By:</strong> {payment.paid_by}
                </div>
                <div>
                  <strong>Approved By:</strong> {payment.approved_by}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Signature:
                </label>
                <div className="border-b border-dashed border-gray-500 h-8 w-full" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalPrintAttachment;
