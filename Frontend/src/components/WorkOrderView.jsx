import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

export default function WorkOrderView() {
  const { id } = useParams();
  const [repairData, setRepairData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    job_card_no: repairData?.id || "",
    plate_number: repairData?.plate_number || "",
    customer_name: repairData?.customer_name || "",
    repair_category: repairData?.repair_category || "",
    last_updated: repairData?.updated_at || "",
    work_details: repairData?.work_details || "",
  });
  console.log(repairData);

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/view-work/${id}`);
        console.log("Fetched Repair Data:", response.data); // Debugging

        setRepairData(response.data);
        setFormData({
          job_card_no: response.data.job_card_no,
          plate_number: response.data.plate_number,
          customer_name: response.data.customer_name,
          repair_category: response.data.repair_category,
          work_details: response.data.work_details,
          last_updated: response.data.updated_at,
        });
      } catch (error) {
        console.error("Error fetching repair details:", error);
        setRepairData(null);
      }
    };

    fetchRepairById();
  }, [id]); // Only run when `id` changes

  // if (loading) {
  //   return (
  //     <p className="text-center mt-10 text-lg font-semibold">Loading...</p>
  //   );
  // }

  if (error) {
    return <p className="text-center mt-10 text-red-600 text-lg">{error}</p>;
  }

  if (!repairData) {
    return (
      <p className="text-center mt-10 text-lg">No repair data available.</p>
    );
  }
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle missing dates
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />

        <main className="phone:p-2 tablet:p-6 w-full phone:max-w-full tablet:max-w-[90%] mx-auto">
          <div className="bg-white shadow-lg rounded-lg phone:p-2 tablet:p-6 border border-gray-200">
            <h2 className="uppercase tracking-wider phone:text-md phone:pt-4 tablet:pt-0 tablet:text-2xl font-semibold text-left text-blue-700 mb-12">
              Work Order Details
            </h2>
            <div className="phone:w-full grid phone:grid-cols-1 tablet:grid-cols-2 gap-8">
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Customer Information
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Job Card Number
                  </div>
                  <div className="border-b p-3">
                    {formData?.job_card_no || "N/A"}
                  </div>
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Name
                  </div>
                  <div className="border-b p-3">
                    {formData?.customer_name || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Plate Number
                  </div>
                  <div className="border-b p-3">
                    {formData?.plate_number || "N/A"}
                  </div>
                </div>
              </div>

              {/* Repair Details */}
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Repair Details
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Repair Category
                  </div>
                  <div className="border-b p-3">
                    {formData?.repair_category || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Category
                  </div>
                  <div className="border-b p-3">
                    {formData?.repair_category || "N/A"}
                  </div>
                </div>
              </div>

              {/* work details */}
              {formData.work_details.map((work, index) => (
                <div
                  key={index}
                  className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden"
                >
                  <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                    Work Details {index + 1}
                  </h3>

                  <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                    {/* Assigned To */}
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Assigned To
                    </div>
                    <div className="border-b p-3">{work.AssignTo || "N/A"}</div>

                    {/* Work Description */}
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Work Description
                    </div>
                    <div className="border-b p-3">
                      {work.workDescription || "N/A"}
                    </div>

                    {/* Code */}
                    <div className="border-r p-3 bg-gray-100 font-semibold">
                      Code
                    </div>
                    <div className="p-3">{work.code || "N/A"}</div>

                    {/* Estimation Time */}
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Estimation Time
                    </div>
                    <div className="border-b p-3">
                      {formatDate(work.EstimationTime) || "N/A"}
                    </div>

                    {/* Unit */}
                    <div className="border-r p-3 bg-gray-100 font-semibold">
                      Unit
                    </div>
                    <div className="p-3">{work.unit || "N/A"}</div>

                    {/* Total Cost */}
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Total Cost
                    </div>
                    <div className="border-b p-3">
                      {work.totalcost || "N/A"}
                    </div>

                    {/* Time In */}
                    <div className="border-r p-3 bg-gray-100 font-semibold">
                      Time In
                    </div>
                    <div className="p-3">
                      {formatDate(work.TimeIn) || "N/A"}
                    </div>

                    {/* Time Out */}
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Time Out
                    </div>
                    <div className="border-b p-3">
                      {formatDate(work.TimeOut) || "N/A"}
                    </div>

                    {/* Status */}
                    <div className="border-r p-3 bg-gray-100 font-semibold">
                      Status
                    </div>
                    <div className="p-3">{work.status || "N/A"}</div>

                    {/* Remark */}
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Remark
                    </div>
                    <div className="border-b p-3">{work.Remark || "N/A"}</div>
                  </div>
                </div>
              ))}

              {/* Payment Information */}
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Payment Information
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Status
                  </div>
                  <div className="border-b p-3">
                    {repairData?.payment_status || "Pending"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Total Cost
                  </div>
                  <div className="border-b p-3">
                    ${repairData?.total_cost || "Not Calculated"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Paid Amount
                  </div>
                  <div className="border-b p-3">
                    ${repairData?.paid_amount || "0"}
                  </div>

                  <div className="border-r p-3 bg-gray-100 font-semibold">
                    Remaining Balance
                  </div>
                  <div className="p-3">
                    ${repairData?.remaining_balance || "0"}
                  </div>
                </div>
              </div>

              {/* Repair Status */}
              {/* <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Repair Status
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Current Status
                  </div>
                  <div className="border-b p-3">
                    {repairData?.status || "In Progress"}
                  </div>

                  <div className="border-r p-3 bg-gray-100 font-semibold">
                    Last Updated
                  </div>
                  <div className="p-3">{repairData?.last_updated || "N/A"}</div>
                </div>
              </div> */}
              {formData.work_details.map((work, index) => (
                <div
                  key={index}
                  className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden"
                >
                  <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                    Repair Status
                  </h3>

                  <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                    <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                      Current Status
                    </div>
                    <div className="border-b p-3">
                      {work?.status || "pending"}
                    </div>

                    <div className="border-r p-3 bg-gray-100 font-semibold">
                      Last Updated
                    </div>
                    <div className="p-3">
                      {formatDate(formData?.last_updated || "N/A")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Customer Information */}
          </div>
        </main>
      </div>
    </div>
  );
}
