import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import BackButton from "../BackButton";

function PaymentDetail() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      console.warn("❌ No id found in params");
      return;
    }

    const fetchPayment = async () => {
      console.log("🔄 Fetching payment details for id:", id);

      try {
        const res = await api.get(`/payments/job/${id}`);
        console.log("✅ Payment API response:", res);

        setPayment(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch payment:", err);
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

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
              Payment Details
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <DetailCard title="Customer Info">
                <DetailItem label="Customer Name" value={payment.name} />
                <DetailItem label="Mobile" value={payment.mobile} />

                <DetailItem
                  label=" Date"
                  value={
                    payment.date
                      ? new Date(payment.date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : ""
                  }
                />
              </DetailCard>

              {/* Payment Info */}
              <DetailCard title="Payment Info">
                <DetailItem label="Payment Method" value={payment.method} />
                <DetailItem label="Payment Status" value={payment.status} />
                <DetailItem
                  label="Paid Amount"
                  value={`${payment.paidAmount} ETB`}
                />
                <DetailItem
                  label="Remaining Amount"
                  value={`${payment.remainingAmount} ETB`}
                />
              </DetailCard>

              {/* Reference Info */}
              <DetailCard title="Reference Info">
                <DetailItem label="Reference" value={payment.reference} />
                <DetailItem
                  label="Payment Date"
                  value={
                    payment.date
                      ? new Date(payment.date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : ""
                  }
                />
                <DetailItem label="Paid By" value={payment.paidBy} />
                <DetailItem label="Approved By" value={payment.approvedBy} />
              </DetailCard>

              {/* Notes */}
              {(payment.reason || payment.remarks) && (
                <DetailCard title="Additional Notes">
                  {payment.reason && (
                    <DetailItem label="Reason" value={payment.reason} />
                  )}
                  {payment.remarks && (
                    <DetailItem label="Remarks" value={payment.remarks} />
                  )}
                </DetailCard>
              )}
            </div>

            {/* Labour Costs */}
            {payment.labourCosts?.length > 0 && (
              <TableCard
                title="Labour Costs"
                headers={["Description", "Time", "Total (ETB)"]}
              >
                {payment.labourCosts.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.time}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </TableCard>
            )}

            {/* Spare Costs */}
            {payment.spareCosts?.length > 0 && (
              <TableCard
                title="Spare Costs"
                headers={[
                  "Item Name",
                  "Part Number",
                  "Qty",
                  "Unit Price",
                  "Total",
                ]}
              >
                {payment.spareCosts.map((item, i) => (
                  <tr key={i}>
                    <td>{item.itemName}</td>
                    <td>{item.partNumber}</td>
                    <td>{item.qty}</td>
                    <td>{item.unitPrice}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </TableCard>
            )}

            {/* Other Costs */}
            {payment.otherCosts?.length > 0 && (
              <TableCard
                title="Other Costs"
                headers={["Description", "Amount"]}
              >
                {payment.otherCosts.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </TableCard>
            )}

            {/* Summary */}
            {payment.summary && (
              <DetailCard title="Summary">
                <DetailItem
                  label="Labour Total"
                  value={`${payment.summary.labourTotal} ETB`}
                />
                <DetailItem
                  label="Spare Total"
                  value={`${payment.summary.spareTotal} ETB`}
                />
                <DetailItem
                  label="Other Total"
                  value={`${payment.summary.otherTotal} ETB`}
                />
                <DetailItem
                  label="Subtotal"
                  value={`${payment.summary.subtotal} ETB`}
                />
                <DetailItem
                  label="VAT"
                  value={`${payment.summary.vatAmount} ETB`}
                />
                <DetailItem
                  label="Grand Total"
                  value={`${payment.summary.grandTotal} ETB`}
                />
              </DetailCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Card component wrapper
const DetailCard = ({ title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-sm mt-6">
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

// Reusable Table wrapper
const TableCard = ({ title, headers, children }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-sm mt-6 overflow-x-auto">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
      {title}
    </h2>
    <table className="min-w-full text-sm border border-gray-300 dark:border-gray-600">
      <thead className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100">
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-left"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
        {children}
      </tbody>
    </table>
  </div>
);

export default PaymentDetail;
