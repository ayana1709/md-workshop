import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";
import logo from "./../images/aa.png";
import ServiceReminder from "./ServiceReminder";
import { useStores } from "@/contexts/storeContext";
// import { useStores } from "../contexts/storeContext";

function PrintSummary({ jobId: propJobId }) {
  const { plateNumber } = useParams();
  const { job_card_no } = useParams();
  // const { jobId } = useParams();
  const { updateGrandTotal } = useStores();
  const { jobId: routeJobId } = useParams();

  // Use the prop if passed, otherwise fallback to route param
  const jobId = propJobId || routeJobId;

  const [customerInfo, setCustomerInfo] = useState(null);
  const [workDetails, setWorkDetails] = useState([]);
  const [itemsOut, setItemsOut] = useState([]);
  console.log("items Out", itemsOut);

  const [outSource, setOutSource] = useState([]);
  const [additionalExpense, setAdditionalExpense] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [includeVAT, setIncludeVAT] = useState(false); // Default: VAT disabled

  const [includeLabourVAT, setIncludeLabourVAT] = useState(false);
  const [includeSpareVAT, setIncludeSpareVAT] = useState(false);
  const [includeOutSourceVAT, setIncludeOutSourceVAT] = useState(false);
  const [additionalCost, setAdditionalCost] = useState(0);
  const navigate = useNavigate();
  const { companyData } = useStores();
  console.log(companyData);

  const [items, setItems] = useState([
    {
      description: "",
      partNumber: "",
      requestquantity: "",
      unitPrice: "",
      totalPrice: "",
    },
  ]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];

    if (name === "requestquantity" || name === "unitPrice") {
      if (/^\d*$/.test(value) || value === "") {
        newItems[index][name] = value;
      }
    } else {
      newItems[index][name] = value;
    }

    newItems[index].totalPrice =
      (Number(newItems[index].requestquantity) || 0) *
      (Number(newItems[index].unitPrice) || 0);

    setItems(newItems);
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        description: "",
        partNumber: "",
        requestquantity: "",
        unitPrice: "",
        totalPrice: "",
      },
    ]);
  };

  // customer information for this job id
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const response = await api.get(`/repairs/${jobId}`);
        setCustomerInfo(response.data || null);
      } catch (error) {
        console.error("Error fetching customer info:", error);
        setCustomerInfo(null);
      }
    };

    if (jobId) {
      fetchCustomerInfo();
    }
  }, [jobId]);

  // list of  labour work order for this job id
  useEffect(() => {
    const fetchWorkDetails = async () => {
      try {
        const response = await api.get(`/work-orders/job-card/${jobId}`);
        // Adjust depending on actual response structure
        const details = response.data?.work_details || [];
        setWorkDetails(details);
      } catch (error) {
        console.error("Error fetching work order job card:", error);
        setWorkDetails([]);
      }
    };

    if (jobId) {
      fetchWorkDetails();
    }
  }, [jobId]);

  // list of outsourse for this job id
  useEffect(() => {
    const fetchItemsOut = async () => {
      try {
        const response = await api.get(`/outsource?job_card_no=${jobId}`);
        const fetchedData = response.data?.data || response.data;

        if (Array.isArray(fetchedData)) {
          setOutSource(fetchedData);
        } else {
          console.error("Unexpected API response format:", fetchedData);
          setOutSource([]);
        }
      } catch (error) {
        console.error("Error fetching outsourced items:", error);
        setOutSource([]);
      }
    };

    if (jobId) {
      fetchItemsOut();
    }
  }, [jobId]);

  // list  spare changed  for the specified jobid
  useEffect(() => {
    const fetchSpareChanges = async () => {
      try {
        const response = await api.get(`/spare-changes?job_card_no=${jobId}`);
        const changesData = response.data?.data || [];
        const spareChangeItems = changesData.flatMap(
          (change) => change.spare_change || []
        );
        setItemsOut(spareChangeItems);
      } catch (error) {
        console.error("❌ Error fetching spare change records:", error);
        setItemsOut([]);
      }
    };

    if (jobId) {
      fetchSpareChanges();
    }
  }, [jobId]);

  const totalLaborCost = workDetails.reduce(
    (sum, work) => sum + Number(work.totalcost || 0),
    0
  );
  const totalPartsCost = itemsOut.reduce(
    (sum, item) => sum + Number(item.totalprice || 0),
    0
  );

  const totalOutCost = outSource.reduce((sum, job, jobIndex) => {
    // Ensure outsourcedetails is an array
    const outsourceArray = Array.isArray(job.outsourcedetails)
      ? job.outsourcedetails
      : JSON.parse(job.outsourcedetails || "[]");
    // Log the parsed outsourcedetails for each job
    console.log(`Job ${jobIndex + 1} outsourcedetails:`, outsourceArray);

    // Sum the requestquantity from each object inside outsourcedetails
    const totalPriceForJob = outsourceArray.reduce(
      (subSum, item, itemIndex) => {
        const price = Number(item.requestquantity) || 0; // Ensure valid number
        console.log(`  Item ${itemIndex + 1} requestquantity: ${price}`);
        return subSum + price;
      },
      0
    );
    // Log the total price for the current job
    console.log(`Total price for Job ${jobIndex + 1}:`, totalPriceForJob);
    return sum + totalPriceForJob;
  }, 0);

  // console.log("Total OutSource Cost:", totalOutCost);

  // console.log(totalOutCost);

  // Calculate VAT amounts
  const labourVAT = includeLabourVAT ? totalLaborCost * 0.15 : 0;
  const spareVAT = includeSpareVAT ? totalPartsCost * 0.15 : 0;
  const outSourceVAT = includeOutSourceVAT ? totalOutCost * 0.15 : 0;

  // Adjusted totals
  const totalLabourWithVAT = totalLaborCost + labourVAT;
  const totalSpareWithVAT = totalPartsCost + spareVAT;
  const totalOutSourceWithVAT = totalOutCost + outSourceVAT;
  const totalCostWithoutVat = totalOutCost + totalLaborCost + totalPartsCost;

  // Total VAT Amount
  const totalVAT = labourVAT + spareVAT + outSourceVAT;

  // Grand total including VAT
  const grandTotal =
    totalLabourWithVAT +
    totalSpareWithVAT +
    totalOutSourceWithVAT +
    Number(additionalCost); // Ensure it's a number

  useEffect(() => {
    if (!jobId) return;

    const totalLabour = workDetails.reduce(
      (sum, item) => sum + (parseFloat(item.totalcost) || 0),
      0
    );

    const totalSpares = itemsOut.reduce(
      (sum, item) => sum + (parseFloat(item.totalprice) || 0),
      0
    );

    const totalOutSource = outSource.reduce((sum, item) => {
      const outsourcedetails = Array.isArray(item.outsourcedetails)
        ? item.outsourcedetails
        : JSON.parse(item.outsourcedetails || "[]");

      return (
        sum +
        outsourcedetails.reduce(
          (innerSum, detail) =>
            innerSum + (parseFloat(detail.requestquantity) || 0),
          0
        )
      );
    }, 0);

    const baseTotal =
      totalLabour +
      totalSpares +
      totalOutSource +
      (parseFloat(additionalCost) || 0);

    const labourVAT = includeLabourVAT ? totalLabour * 0.15 : 0;
    const spareVAT = includeSpareVAT ? totalSpares * 0.15 : 0;
    const outsourceVAT = includeOutSourceVAT ? totalOutSource * 0.15 : 0;

    const total = baseTotal + labourVAT + spareVAT + outsourceVAT;

    console.log("✅ Final Calculated Total:", total);
    updateGrandTotal(jobId, total);
  }, [
    jobId,
    workDetails,
    itemsOut,
    outSource,
    additionalCost,
    includeLabourVAT,
    includeSpareVAT,
    includeOutSourceVAT,
  ]);

  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="flex overflow-hidden overflow-y-auto">
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="fixed top-4 left-[19%] z-[99999999]">
          <BackButton />
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 mt-2 py-2 rounded-md shadow-md hover:bg-blue-700 focus:outline-none"
          >
            Print Page 🖨️
          </button>
        </div>
        <style>
          {`
  @media print {
  * {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
  }
  
  body {
    width: 100%;
  }

  .print-container {
    width: 100%;
    transform: scale(1.0); /* Adjust scaling to fit content */
    overflow: hidden;
    page-break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid black;
    font-size: 16px;
  }

  @page {
    size: A4 portrait;
    margin: 2; /* Completely removes margin */
  }
}

  `}
        </style>

        <main className="grow mt-0">
          <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="print-container">
              {/* <div className="w-full flex gap-20 items-center justify-center">
                <img src={logo} className="w-[40%]" />
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    ስፒድ ሜተር ትሬዲንግ ፒ ኤል ሲ
                  </h2>
                  <h2 className="text-2xl uppercase tracking-wider font-bold text-gray-800 dark:text-white">
                    speed meter trading plc
                  </h2>
                </div>
              </div> */}
              {/* <p className="text-gray-600 dark:text-white">
                Plate Number: {plateNumber}
              </p> */}

              <div className="grid grid-cols-3 gap-4 items-start border-b pb-4 mb-6">
                {/* Left: Logo */}
                <div className="flex items-start justify-center">
                  {companyData?.logo && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/storage/${
                        companyData.logo
                      }`}
                      alt="Company Logo"
                      className="h-24 object-contain"
                    />
                  )}
                </div>

                {/* Center: Company Info */}
                <div className="space-y-1 text-sm text-gray-800 leading-snug">
                  <h2 className="text-lg font-bold">{companyData?.name_en}</h2>
                  <p className="text-sm italic text-gray-600">
                    {companyData?.tagline}
                  </p>
                  <p>
                    <strong>Address:</strong> {companyData?.address}
                  </p>
                  <p>
                    <strong>Phone:</strong> {companyData?.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {companyData?.email}
                  </p>
                  <p>
                    <strong>Website:</strong> {companyData?.website}
                  </p>
                  <p>
                    <strong>Established:</strong> {companyData?.established}
                  </p>
                </div>

                {/* Right: Business & Job Info */}
                <div className="text-sm text-right space-y-1 text-gray-800">
                  <h3 className="text-lg font-bold">Repair Summary</h3>
                  <p>
                    <strong>Job ID:</strong> {customerInfo?.job_id}
                  </p>
                  <p>
                    <strong>Received Date:</strong>{" "}
                    {customerInfo?.received_date}
                  </p>
                  <p>
                    <strong>Business Type:</strong> {companyData?.business_type}
                  </p>
                  <p>
                    <strong>TIN:</strong> {companyData?.tin}
                  </p>
                  <p>
                    <strong>VAT Reg. No:</strong> {companyData?.vat}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-center mb-4 border-b  p-6 ">
                Print Summary
              </h2>

              {/* Labour Table */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6">
                Labour Cost
              </h3>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={includeLabourVAT}
                  onChange={() => setIncludeLabourVAT(!includeLabourVAT)}
                  className="mr-2 dark:bg-gray-800"
                />
                <label className="text-gray-800 dark:text-gray-200 font-semibold">
                  Apply VAT (15%)
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 shadow-md border-collapse">
                  <thead className="bg-gray-300 dark:bg-table-head dark:text-white">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">S.no</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Estimation Time
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Total Cost (ETB)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {workDetails.map((work, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {work.workDescription}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {work.EstimationTime} hrs
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {work.totalcost} ETB
                        </td>
                      </tr>
                    ))}
                    {includeLabourVAT && (
                      <tr className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                        <td
                          colSpan="3"
                          className="border border-gray-300 px-4 py-2"
                        >
                          VAT (15%)
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {labourVAT.toFixed(2)} ETB
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-200 dark:bg-gray-800 font-semibold dark:text-white">
                      <td
                        colSpan="3"
                        className="border border-gray-300 px-4 py-2"
                      >
                        Total Labour Cost Amount
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {totalLabourWithVAT.toFixed(2)} ETB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Spare Request Items Table */}
              <h3 className="text-lg font-semibold text-gray-800 mt-6 dark:text-gray-200">
                Spare Change Cost
              </h3>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={includeSpareVAT}
                  onChange={() => setIncludeSpareVAT(!includeSpareVAT)}
                  className="mr-2 dark:bg-gray-800"
                />
                <label className="text-gray-800 dark:text-gray-200 font-semibold">
                  Apply VAT (15%)
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 shadow-md border-collapse">
                  <thead className="bg-gray-300 dark:bg-table-head dark:text-white">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">S.no</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Item Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Part Number
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Request Qty
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Total Price (ETB)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsOut.length > 0 ? (
                      itemsOut.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.itemname}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.partnumber}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.requestquantity}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.unitprice} ETB
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.totalprice} ETB
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 border border-gray-300"
                        ></td>
                      </tr>
                    )}
                    <tr className="bg-gray-200 font-semibold dark:bg-gray-800 dark:text-white">
                      <td
                        colSpan="5"
                        className="border border-gray-300 px-4 py-2"
                      >
                        Total Spare Cost Amount
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {totalSpareWithVAT.toFixed(2)} ETB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Out source  table  */}
              <h3 className="text-lg font-semibold text-gray-800 mt-6">
                Other Service
              </h3>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={includeOutSourceVAT}
                  onChange={() => setIncludeOutSourceVAT(!includeOutSourceVAT)}
                  className="mr-2 dark:bg-gray-800"
                />
                <label className="text-gray-800 font-semibold">
                  Apply VAT (15%)
                </label>
              </div>
              <div className="overflow-x-auto">
                <div>
                  <div className="w-full overflow-x-auto rounded-lg shadow-md">
                    <table className="w-full min-w-max text-sm border border-gray-400">
                      <thead className="bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800">
                        <tr>
                          <th className="border border-gray-400 px-4 py-3 text-left font-semibold">
                            S.no
                          </th>
                          <th className="border border-gray-400 px-4 py-3 text-left font-semibold">
                            Description
                          </th>
                          <th className="border border-gray-400 px-4 py-3 text-left font-semibold">
                            Part Number
                          </th>
                          <th className="border border-gray-400 px-4 py-3 text-left font-semibold">
                            Assigned to
                          </th>
                          <th className="border border-gray-400 px-4 py-3 text-left font-semibold">
                            Total Price (ETB)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 dark:text-white">
                        {outSource.map((item, index) => {
                          const outsourcedDetailsArray =
                            item.outsourcedetails || [];

                          return outsourcedDetailsArray.map(
                            (detail, subIndex) => (
                              <tr
                                key={`${index}-${subIndex}`}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <td className="border border-gray-400 px-4 py-2">
                                  {index + 1}
                                </td>
                                <td className="border border-gray-400 px-4 py-2 whitespace-nowrap">
                                  {detail.description}
                                </td>
                                <td className="border border-gray-400 px-4 py-2 whitespace-nowrap">
                                  {detail.partnumber}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                  {detail.requestedby}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                  {Number(detail.requestquantity) || 0} ETB
                                </td>
                              </tr>
                            )
                          );
                        })}

                        {includeOutSourceVAT && (
                          <tr className="bg-gray-100 dark:bg-gray-800 font-medium">
                            <td
                              colSpan="4"
                              className="border border-gray-400 px-4 py-2"
                            >
                              VAT (15%)
                            </td>
                            <td className="border border-gray-400 px-4 py-2">
                              {outSourceVAT.toFixed(2)} ETB
                            </td>
                          </tr>
                        )}

                        <tr className="bg-gray-300 dark:bg-gray-900 font-semibold">
                          <td
                            colSpan="4"
                            className="border border-gray-400 px-4 py-2"
                          >
                            Total cost Amount for otherserviceTotal cost Amount
                            for otherservice
                          </td>
                          <td className="border border-gray-400 px-4 py-2">
                            {totalOutSourceWithVAT.toFixed(2)} ETB
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Final Cost Summary */}
              {/* <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="vatToggle"
                checked={includeVAT}
                onChange={() => setIncludeVAT(!includeVAT)}
                className="mr-2"
              />
              <label  
                htmlFor="vatToggle"
                className="text-gray-800 font-semibold"
              >
                Apply VAT (15%)
              </label>
            </div> */}

              {/* Final Cost Summary */}

              <h3 className="text-lg font-semibold text-gray-800 mt-6">
                Final Cost Summary
              </h3>
              <div className="p-4 m-2 bg-gray-200 rounded-lg shadow-md">
                <table className="w-full text-sm border border-gray-300">
                  <tbody>
                    <tr className="bg-gray-300 font-semibold">
                      <td className="border px-4 py-2">
                        Total Cost (Without VAT)
                      </td>
                      <td className="border px-4 py-2">
                        {(
                          totalLaborCost +
                          totalPartsCost +
                          totalOutCost
                        ).toFixed(2)}{" "}
                        ETB
                      </td>
                    </tr>

                    {/* Additional Cost Input */}
                    <tr>
                      <td className="border px-4 py-2 font-semibold">
                        Additional Cost
                      </td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          value={additionalCost}
                          onChange={(e) => setAdditionalCost(e.target.value)} // Update state
                          className="w-full p-2 border rounded-md"
                          placeholder="Enter additional cost..."
                        />
                      </td>
                    </tr>

                    <tr className="bg-yellow-200 font-semibold">
                      <td className="border px-4 py-2">Total VAT Amount</td>
                      <td className="border px-4 py-2">
                        {totalVAT.toFixed(2)} ETB
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-semibold">
                        Grand Total
                      </td>
                      <td className="border px-4 py-2 text-blue-700">
                        {grandTotal.toFixed(2)} ETB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* <ServiceReminder plateNumber={plateNumber} /> */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PrintSummary;
