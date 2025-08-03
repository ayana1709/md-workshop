import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";

export default function ViewBolo() {
  const { id } = useParams();
  const [repairData, setRepairData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(repairData);
  useEffect(() => {
    const fetchRepairDetails = async () => {
      try {
        const response = await api.get(`/bolo/${id}`);
        if (response.data) {
          setRepairData(response.data);
        } else {
          throw new Error("Invalid data received");
        }
      } catch (error) {
        console.error("Error fetching repair details", error);
        setError("Failed to fetch repair details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairDetails();
  }, [id]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-lg font-semibold">Loading...</p>
    );
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600 text-lg">{error}</p>;
  }

  if (!repairData) {
    return (
      <p className="text-center mt-10 text-lg">No repair data available.</p>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />
        <div className="fixed top-4 left-[19%] z-[99999999]">
          <BackButton />
        </div>

        <main className="phone:p-2 tablet:p-6 w-full phone:max-w-full tablet:max-w-[90%] mx-auto">
          <div className="bg-white shadow-lg rounded-lg phone:p-2 tablet:p-6 border border-gray-200">
            <h2 className="uppercase tracking-wider phone:text-md phone:pt-4 tablet:pt-0 tablet:text-2xl font-semibold text-left text-blue-700 mb-12">
              Bolo Details
            </h2>
            <div className="phone:w-full grid phone:grid-cols-1 tablet:grid-cols-2 gap-8">
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Customer Information
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Name
                  </div>
                  <div className="border-b p-3">
                    {repairData?.customer_name || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Type
                  </div>
                  <div className="border-b p-3">
                    {repairData?.customer_type || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Mobile
                  </div>
                  <div className="border-b p-3">
                    {repairData?.mobile || "N/A"}
                  </div>

                  {/* <div className="border-r p-3 bg-gray-100 font-semibold">
                    Email
                  </div>
                  <div className="p-3">{repairData?.email || "N/A"}</div> */}
                </div>
              </div>

              {/* Repair Details */}
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Repair Details
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Checked Date
                  </div>
                  <div className="border-b p-3">
                    {repairData?.checked_date || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Issue Date
                  </div>
                  <div className="border-b p-3">
                    {repairData?.issue_date || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Vehicle Type
                  </div>
                  <div className="border-b p-3">
                    {repairData?.vehicle_type || "N/A"}
                  </div>

                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Condition
                  </div>
                  <div className="border-b p-3">
                    {repairData?.condition || "N/A"}
                  </div>

                  <div className="border-r p-3 bg-gray-100 font-semibold">
                    Result
                  </div>
                  <div className="p-3">{repairData?.result || "N/A"}</div>
                </div>
              </div>

              {/* Assigned Technician */}
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
                <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-[5px] inline-block">
                  Professional
                </h3>

                <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
                  <div className="border-b border-r p-3 bg-gray-100 font-semibold">
                    Name
                  </div>
                  <div className="border-b p-3">
                    {repairData?.professional || "Not Assigned"}
                  </div>

                  <div className="border-r p-3 bg-gray-100 font-semibold">
                    Contact
                  </div>
                  <div className="p-3">
                    {repairData?.technician_contact || "N/A"}
                  </div>
                </div>
              </div>

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
                    ${repairData?.payment_total || "0"}
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
              <div className="mb-6 border rounded-md px-6 py-4 hover:transform hover:scale-102 hover:-translate-y-[2%] transition-all duration-500 will-change-transform overflow-hidden">
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
                  <div className="p-3">{repairData?.updated_at || "N/A"}</div>
                </div>
              </div>
            </div>
            {/* Customer Information */}
          </div>
        </main>
      </div>
    </div>
  );
}
