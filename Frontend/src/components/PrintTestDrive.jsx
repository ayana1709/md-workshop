import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";
import api from "../api";
import logo from "./../images/aa.png";
export default function PrintTestDrive() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preTestData, setPreTestData] = useState(null);
  const [duringTestData, setDuringTestData] = useState(null);
  const [preLoading, setPreLoading] = useState(true);
  const [duringLoading, setDuringLoading] = useState(true);
  const [preError, setPreError] = useState(null);
  const [duringError, setDuringError] = useState(null);

  // Fetch Pre-Test Data
  useEffect(() => {
    const fetchPreTest = async () => {
      try {
        const response = await api.get(`/pre-drive-tests/${id}`);
        setPreTestData(response.data);
      } catch (error) {
        setPreError("Failed to fetch pre-test data.");
      } finally {
        setPreLoading(false);
      }
    };

    fetchPreTest();
  }, [id]);

  // Fetch During Drive Test Data
  useEffect(() => {
    const fetchDuringTest = async () => {
      try {
        const response = await api.get(`/during-drive-tests/${id}`);
        setDuringTestData(response.data);
      } catch (error) {
        setDuringError("Failed to fetch during-drive test data.");
      } finally {
        setDuringLoading(false);
      }
    };

    fetchDuringTest();
  }, [id]);

  useEffect(() => {
    const handleAfterPrint = () => {
      // Navigate back to job-order-list after printing or canceling
      navigate("/work/Test_drive");
    };

    // Add event listener for afterprint
    window.addEventListener("afterprint", handleAfterPrint);

    // Trigger print with delay to ensure content is rendered
    setTimeout(() => {
      window.print();
    }, 3000); // Delay for page rendering before triggering print

    // Clean up event listener when the component unmounts
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [navigate]);

  return (
    <div className="flex overflow-hidden overflow-y-auto bg-gray-100">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* <Header />
        <div className="fixed top-4 left-[19%] z-[99999999]">
          <BackButton />
        </div> */}
        <main className="p-2 w-full max-w-[90%] mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <div className="w-full flex gap-20 items-center justify-center">
              <img src={logo} className="w-[30%]" />
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  ስፒድ ሜተር ትሬዲንግ ፒ ኤል ሲ
                </h2>
                <h2 className="text-2xl uppercase tracking-wider font-bold text-gray-800">
                  speed meter trading plc
                </h2>
              </div>
            </div>

            <div className="grid phone:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-2 gap-8">
              {/* Pre-Test Information */}
              {preLoading ? (
                <p className="text-center text-lg font-semibold">
                  Loading Pre-Test Data...
                </p>
              ) : preError ? (
                <p className="text-center text-red-600">{preError}</p>
              ) : preTestData ? (
                <div className="border rounded-md p-6 bg-white shadow">
                  <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-2">
                    Pre-Test Information
                  </h3>
                  <p>
                    <strong>Job Card No:</strong> {preTestData.job_card_no}
                  </p>
                  <p>
                    <strong>Plate Number:</strong> {preTestData.plate_number}
                  </p>
                  <p>
                    <strong>Customer Name:</strong> {preTestData.customer_name}
                  </p>
                  <p>
                    <strong>Checked By:</strong> {preTestData.checked_by}
                  </p>

                  {/* Work Details */}
                  <h4 className="text-lg font-semibold text-gray-700 mt-6">
                    Work Details
                  </h4>
                  <table className="w-full mt-2 border border-gray-300">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-gray-300 p-2">
                          Description
                        </th>
                        <th className="border border-gray-300 p-2">Status</th>
                        <th className="border border-gray-300 p-2">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preTestData.work_details.map((work, index) => (
                        <tr key={index} className="border border-gray-300">
                          <td className="p-2">{work.workDescription}</td>
                          <td
                            className={`p-2 ${
                              work.status === "Pass"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {work.status}
                          </td>
                          <td className="p-2">{work.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* During Drive Test Information */}
              {duringLoading ? (
                <p className="text-center text-lg font-semibold">
                  Loading During Drive Test Data...
                </p>
              ) : duringError ? (
                <p className="text-center text-red-600">{duringError}</p>
              ) : duringTestData ? (
                <div className="border rounded-md p-6 bg-white shadow">
                  <h3 className="uppercase text-lg font-semibold text-gray-700 mb-4 border-b-2 border-blue-300 pb-2">
                    During Drive Test Information
                  </h3>
                  <p>
                    <strong>Job Card No:</strong> {duringTestData.job_card_no}
                  </p>
                  <p>
                    <strong>Plate Number:</strong> {duringTestData.plate_number}
                  </p>
                  <p>
                    <strong>Customer Name:</strong>{" "}
                    {duringTestData.customer_name}
                  </p>
                  <p>
                    <strong>Checked By:</strong> {duringTestData.checked_by}
                  </p>

                  {/* Work Details */}
                  <h4 className="text-lg font-semibold text-gray-700 mt-6">
                    Work Details
                  </h4>
                  <table className="w-full mt-2 border border-gray-300">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-gray-300 p-2">
                          Description
                        </th>
                        <th className="border border-gray-300 p-2">Status</th>
                        <th className="border border-gray-300 p-2">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duringTestData.work_details.map((work, index) => (
                        <tr key={index} className="border border-gray-300">
                          <td className="p-2">{work.workDescription}</td>
                          <td
                            className={`p-2 ${
                              work.status === "Pass"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {work.status}
                          </td>
                          <td className="p-2">{work.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
