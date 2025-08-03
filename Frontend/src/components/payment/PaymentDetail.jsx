import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import BackButton from "../BackButton";

function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  console.log(id);

  useEffect(() => {
    if (!id) return; // Allow both numeric-like and alphanumeric IDs

    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/${id}`);
        setPayment(res.data);
      } catch (err) {
        console.error("Failed to fetch payment:", err);
        setPayment(null);
      }
    };

    fetchPayment();
  }, [id]);

  if (!payment) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-semibold text-gray-600 dark:text-white">
          Loading payment details...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="fixed phone:top-[13%] tablet:top-4 phone:left-2 tablet:left-[19%] z-[99999999]">
          <BackButton />
        </div>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
              Payment Details
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <DetailCard title="Customer Info">
                <DetailItem
                  label="Customer Name"
                  value={payment.customer_name}
                />
                <DetailItem label="Plate Number" value={payment.plate_number} />
                <DetailItem label="Job ID" value={payment.job_id} />
              </DetailCard>

              {/* Payment Info */}
              <DetailCard title="Payment Info">
                <DetailItem label="Method" value={payment.payment_method} />
                <DetailItem label="Status" value={payment.payment_status} />
                <DetailItem
                  label="Paid Amount"
                  value={`${payment.paid_amount} ETB`}
                />
                <DetailItem
                  label="Remaining Amount"
                  value={`${payment.remaining_amount} ETB`}
                />
              </DetailCard>

              {/* Reference Info */}
              <DetailCard title="Reference Info">
                <DetailItem label="Ref No" value={payment.ref_no} />
                <DetailItem label="Payment Date" value={payment.payment_date} />
                <DetailItem label="Paid By" value={payment.paid_by} />
                <DetailItem label="Approved By" value={payment.approved_by} />
              </DetailCard>

              {/* Optional Info */}
              {(payment.reason || payment.remark) && (
                <DetailCard title="Additional Notes">
                  {payment.reason && (
                    <DetailItem label="Reason" value={payment.reason} />
                  )}
                  {payment.remark && (
                    <DetailItem label="Remark" value={payment.remark} />
                  )}
                </DetailCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card component wrapper
const DetailCard = ({ title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
      {title}
    </h2>
    <div className="space-y-2">{children}</div>
  </div>
);

// Reusable label-value pair
const DetailItem = ({ label, value }) => (
  <p className="text-gray-700 dark:text-gray-200">
    <span className="font-medium">{label}:</span> {value || "-"}
  </p>
);

export default PaymentDetail;
