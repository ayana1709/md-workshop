import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { useStores } from "@/contexts/storeContext";
import api from "@/api";
import BackButton from "../BackButton";
import Swal from "sweetalert2";
// import { useStores } from "../contexts/storeContext";

function SendPayment() {
  const { plateNumber } = useParams();
  const { job_card_no } = useParams();

  const { updateGrandTotal } = useStores();
  const { jobId: routeJobId } = useParams();

  // Use the prop if passed, otherwise fallback to route param
  const jobId = routeJobId;

  const [customerInfo, setCustomerInfo] = useState(null);
  const [workDetails, setWorkDetails] = useState([]);
  const [itemsOut, setItemsOut] = useState([]);

  const [outSource, setOutSource] = useState([]);
  const [additionalExpense, setAdditionalExpense] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [includeVAT, setIncludeVAT] = useState(false); // Default: VAT disabled

  const [includeLabourVAT, setIncludeLabourVAT] = useState(false);
  const [includeSpareVAT, setIncludeSpareVAT] = useState(false);
  const [includeOutSourceVAT, setIncludeOutSourceVAT] = useState(false);
  const [additionalCost, setAdditionalCost] = useState(0);
  const navigate = useNavigate();

  const [items, setItems] = useState([
    {
      description: "",
      partNumber: "",
      requestquantity: "",
      unitPrice: "",
      totalPrice: "",
    },
  ]);

  const { companyData } = useStores();

  // Resolve logo path from API or fallback
  const logoUrl = companyData?.logo
    ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
    : "/logo.png";
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
  const [formData, setFormData] = useState({
    payment_method: "Cash",
    payment_status: "Full Payment",
    paid_by: "",
    approved_by: "",
    ref_no: Math.random().toString(36).substring(2, 10).toUpperCase(),
    // Random editable ref_no
    payment_date: "",
    reason: "",
    remark: "",
    paid_amount: "",
    remaining_amount: 0,
    customer_name: "",
    plate_number: "",
    job_id: jobId,
    repair_registration_id: null,
    from_bank: "",
    to_bank: "",
  });
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
        const response = await api.get(`/outsource/job-card/${jobId}`);
        const fetchedData = response.data;

        if (fetchedData?.outsourcedetails) {
          setOutSource(fetchedData.outsourcedetails); // ✅ array
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
  // inside your component, after grandTotal is defined:
  const remainingAmount = grandTotal - (Number(formData.paid_amount) || 0);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transform labour costs
    const labourCosts = workDetails.map((work) => ({
      description: work.workDescription,
      time: work.EstimationTime,
      total: Number(work.totalcost) || 0,
    }));

    // Transform spare costs
    const spareCosts = itemsOut.map((item) => ({
      itemName: item.itemname,
      partNumber: item.partnumber,
      qty: Number(item.requestquantity) || 0,
      unitPrice: Number(item.unitprice) || 0,
      total: Number(item.totalprice) || 0,
    }));

    // Transform outsource costs
    const otherCosts = outSource.flatMap((job) => {
      const outsourceArray = Array.isArray(job.outsourcedetails)
        ? job.outsourcedetails
        : JSON.parse(job.outsourcedetails || "[]");

      return outsourceArray.map((detail) => ({
        description: detail.description,
        amount: Number(detail.requestquantity) || 0,
      }));
    });

    // const remainingAmount = grandTotal - (Number(formData.paid_amount) || 0);

    // Build final payload
    const payload = {
      jobId,
      name: customerInfo?.customer_name || "",
      mobile: customerInfo?.mobile || "",
      plate: customerInfo?.vehicles?.[0]?.plate_no || "",
      model: customerInfo?.vehicles?.[0]?.model || "",
      priority: customerInfo?.priority || "",
      receivedDate: customerInfo?.received_date || "",
      dateOut: customerInfo?.promise_date || "",
      method: formData.payment_method.toLowerCase(), // cash|transfer|card
      status: formData.payment_status,
      paidAmount: Number(formData.paid_amount) || 0,
      remainingAmount,
      reference: formData.ref_no,
      date: formData.payment_date,
      paidBy: formData.paid_by,
      approvedBy: formData.approved_by,
      reason: formData.reason,
      remarks: formData.remark,
      labourCosts,
      spareCosts,
      otherCosts,
      summary: {
        totalLaborCost,
        totalPartsCost,
        totalOutCost,
        totalVAT,
        additionalCost: Number(additionalCost) || 0,
        grandTotal,
      },
    };

    try {
      await api.post("/payments", payload);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "✅ Payment submitted successfully!",
        timer: 2500,
        showConfirmButton: false,
      });

      // Reset form but keep job info
      setFormData((prev) => ({
        ...prev,
        payment_method: "Cash",
        payment_status: "Full Payment",
        paid_by: "",
        approved_by: "",
        ref_no: Math.random().toString(36).substring(2, 10).toUpperCase(),
        payment_date: "",
        reason: "",
        remark: "",
        paid_amount: "",
        from_bank: "",
        to_bank: "",
      }));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ Submission failed. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: message,
      });
    }
  };

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
        {/* <div className="absolute top-2 right-2"> */}

        <style>
          {`
  @media print {
    .no-print {
      display: none !important;
    }

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
      transform: scale(1.0);
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
      margin: 2;
    }
  }
`}
        </style>

        <main className="grow mt-0">
          <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="print-container">
              <div className="w-full flex items-center justify-center gap-8 p-4">
                {/* Logo container */}
                <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Company Info */}
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    {companyData?.name_am || "የኩባንያ ስም (AM)"}
                  </h2>
                  <h2 className="text-lg sm:text-xl uppercase tracking-wider font-bold text-gray-800 dark:text-white">
                    {companyData?.name_en || "COMPANY NAME (EN)"}
                  </h2>
                </div>
              </div>

              {/* <p className="text-gray-600 dark:text-white">
                Plate Number: {plateNumber}
              </p> */}

              <h2 className="text-2xl font-semibold text-center mb-4 border-b  p-6 ">
                Job Summary
              </h2>
              {/* Customer & Vehicle Info */}
              {customerInfo && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Customer & Vehicle Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                    <ul className="space-y-2">
                      <li className="dark:text-gray-200">
                        <strong className="dark:text-gray-100">
                          Customer Name:
                        </strong>{" "}
                        {customerInfo.customer_name}
                      </li>
                      <li className="dark:text-gray-200">
                        <strong className="dark:text-gray-100">Mobile:</strong>{" "}
                        {customerInfo.mobile}
                      </li>
                      <li className="dark:text-gray-200">
                        <strong className="dark:text-gray-100">
                          {" "}
                          Customer Type:
                        </strong>{" "}
                        {customerInfo.customer_type}
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="dark:text-gray-200">
                        <strong className="dark:text-gray-100">
                          Received Date:
                        </strong>{" "}
                        {customerInfo.received_date}
                      </li>
                      <li className="dark:text-gray-200">
                        <strong className="dark:text-gray-100">
                          Date Out:
                        </strong>{" "}
                        {customerInfo.promise_date}
                      </li>
                      <li className="dark:text-gray-200">
                        <strong className="dark:text-gray-100">
                          Priority:
                        </strong>{" "}
                        {customerInfo.priority}
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {/* Labour Table */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6">
                Labour Cost
              </h3>
              <div className="flex items-center mt-2 no-print">
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
              <div className="flex items-center mt-2 no-print">
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
                Out Source
              </h3>
              <div className="flex items-center mt-2 no-print">
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
                        {outSource.map((detail, index) => (
                          <tr
                            key={detail.id || index}
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
                              {detail.requestedby || "-"}
                            </td>
                            <td className="border border-gray-400 px-4 py-2">
                              {Number(detail.requestquantity) || 0} ETB
                            </td>
                          </tr>
                        ))}

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
                            Total cost Amount for outsource
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

            <div className="w-full border-t mt-8 pt-6 text-sm">
              <div className="max-w-5xl mx-auto px-6 pb-12">
                <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-800 dark:text-white border-b pb-2">
                  Payment Details
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-6 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md"
                >
                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Payment Method
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    >
                      <option>Cash</option>
                      <option>Transfer</option>
                      <option>Credit</option>
                      <option>Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Payment Status
                    </label>
                    <select
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    >
                      <option>Full Payment</option>
                      <option>Advance</option>
                      <option>Credit</option>
                      <option>Remaining</option>
                    </select>
                  </div>

                  {formData.payment_method === "Transfer" && (
                    <>
                      <div>
                        <label className="block font-medium text-gray-800 dark:text-white">
                          From Bank
                        </label>
                        <input
                          type="text"
                          name="from_bank"
                          value={formData.from_bank}
                          onChange={handleChange}
                          className="w-full p-2 rounded-md border"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-800 dark:text-white">
                          To Bank
                        </label>
                        <input
                          type="text"
                          name="to_bank"
                          value={formData.to_bank}
                          onChange={handleChange}
                          className="w-full p-2 rounded-md border"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Paid Amount (ETB)
                    </label>
                    <input
                      type="number"
                      name="paid_amount"
                      value={formData.paid_amount}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Remaining Amount (ETB)
                    </label>
                    <input
                      type="text"
                      value={remainingAmount.toFixed(2)}
                      readOnly
                      className="w-full p-2 rounded-md border bg-gray-200 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Reference No
                    </label>
                    <input
                      type="text"
                      name="ref_no"
                      value={formData.ref_no}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Date of Payment
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      value={formData.payment_date}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Paid By
                    </label>
                    <input
                      type="text"
                      name="paid_by"
                      value={formData.paid_by}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Approved By
                    </label>
                    <input
                      type="text"
                      name="approved_by"
                      value={formData.approved_by}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Reason of Payment
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-medium text-gray-800 dark:text-white">
                      Remark
                    </label>
                    <textarea
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                      Submit Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SendPayment;
