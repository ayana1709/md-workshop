import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import Swal from "sweetalert2";

// Import the ItemTable (we'll ensure it's read-only here)
import ItemTable from "@/components/StoreIssue/ItemTable"; // Keep ItemTable import if needed for structure
import { Print } from "@mui/icons-material";
import PrintHeader from "../PrintHeader";

// --- Component Start ---

const StoreRequestPrint = () => { // Renamed component
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // Renamed state from issue to request
  const [request, setRequest] = useState(null); 

  // Renamed fetch function
  const fetchRequest = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      // Changed endpoint from /store-issues to /store-requests
      const response = await api.get(`/store-requests/${id}`);
      const requestData = response.data.data || response.data;

      // Note: Financial fields (subtotal, total_vat, amount_in_words) 
      // were NOT in the 'store_requests' migration, but they are kept here 
      // assuming they are still needed for the printout and handled elsewhere 
      // (e.g., attached to the request object by a backend transformer).
      setRequest({
        ...requestData,
        // Ensure numerical data is correctly parsed
        subtotal: parseFloat(requestData.subtotal) || 0,
        total_vat: parseFloat(requestData.total_vat) || 0,
        total_price_including_vat:
          parseFloat(requestData.total_price_including_vat) || 0,
      });
    } catch (error) {
      console.error("Failed to load store request:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to load store request.",
      });
      // Changed navigation link
      navigate("/store-request/manager"); 
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-gray-700 dark:text-gray-300">
        Loading Store Request Document...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        Error: Request not found.
      </div>
    );
  }

  // Destructure request fields (only using fields from the store_requests migration + financial fields)
  const {
    ref_no,
    date,
    objective_for,
    request_remark,
    requested_items, // Renamed from store_items
    requested_department,
    requested_by,
    status, // Using the single 'status' field for approval status
    
    // Financial fields (still included for print layout, if necessary)
    total_price_including_vat,
    subtotal,
    total_vat,
    amount_in_words,
  } = request;

  const requestDate = date ? new Date(date).toLocaleDateString("en-US") : "N/A";

  return (
    
    <>
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded shadow transition "
        >
          <Print fontSize="small" />
          Print
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white print:bg-white print:p-0">
        <div className="p-8 print:p-0 print:text-[10pt] text-gray-900">
          {/* --- DOCUMENT HEADER (Matching Sketch Layout) --- */}
          <div className="border border-gray-900 p-2">
            <PrintHeader />
          </div>

          <div className="p-4 mt-3 mb-4">
            {/* Top Row - Title and Reference */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <div className="relative inline-block">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    ከሰቶር የ ዕቃ መጠየቂያ ሰነድ
                  </h1>
                  <h2 className="text-lg font-bold text-gray-700">
                    Store Request Form
                  </h2>
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                </div>
              </div>
              <div className="text-right space-y-1 text-sm text-gray-700">
                <p>
                  <span className="text-gray-600 font-bold">ቀን / Date:</span>
                  <span className="border-b border-gray-400 ml-2 inline-block min-w-[80px] font-semibold">
                    {requestDate || "-_________"}
                  </span>
                </p>

                <p>
                  <span className="text-gray-600 font-bold">መቁ / Ref No:</span>
                  <span className="border-b border-gray-400 ml-2 inline-block min-w-[80px] font-semibold">
                    {ref_no || "__________"}
                  </span>
                </p>
              </div>
            </div>

            {/* Purpose Section */}
            <div className="flex items-start ms-10">
              {/* Label Section */}
              <div className="w-1/6 pt-1">
                <div className="text-sm leading-tight">
                  <p className="font-bold text-gray-800 text-lg">የሚጠየቅበት ዓላማ</p>
                  <p className="font-medium text-gray-600 text-lg mt-1">
                    Purpose
                  </p>
                </div>
              </div>

              {/* Value with Line */}
              <div className="flex-1 border-b border-gray-400 pb-1">
                <p className="text-gray-800 inline">
                  {objective_for || "______________________________"}
                </p>
              </div>
            </div>
          </div>

          {/* --- ITEMS TABLE (Based on Sketch Columns) --- */}
          <div className="mb-6">
            <div className="border border-gray-900">
              {/* Header Row - Columns adjusted for Request only */}
              <div className="grid grid-cols-11 font-bold text-center border-b border-gray-900 bg-gray-100">
                <div className="col-span-1 border-r border-gray-900 p-1">
                  S.N
                </div>
                <div className="col-span-3 border-r border-gray-900 p-1">
                  የእቃዎች ስም
                  <br />
                  Item Name
                </div>
                <div className="col-span-1 border-r border-gray-900 p-1">
                  አይነት Type
                </div>
                <div className="col-span-1 border-r border-gray-900 p-1">
                  ኮድ Code
                </div>
                <div className="col-span-1 border-r border-gray-900 p-1">
                  መለኪያ Unit
                </div>
                <div className="col-span-1 border-r border-gray-900 p-1">
                  የዕቃ Part No
                </div>
                <div className="col-span-1 border-r border-gray-900 p-1">
                  የተጠየቀ ብዛት Req. Qty
                </div>
                <div className="col-span-2 p-1">ማስጠንቀቂያ Remark</div>
              </div>

              {/* Data Rows */}
              {requested_items && requested_items.length > 0 ? (
                requested_items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-11 text-center text-sm"
                  >
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b">
                      {index + 1}
                    </div>
                    <div className="col-span-3 border-r border-gray-900 p-1 border-b text-left">
                      {item.item_name || "N/A"}
                    </div>
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b">
                      {item.type || "N/A"}
                    </div>
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b">
                      {item.code || "N/A"}
                    </div>
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b">
                      {item.unit || "N/A"}
                    </div>
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b">
                      {item.part_no || "N/A"}
                    </div>
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b font-bold">
                      {/* Only showing requested quantity */}
                      {item.quantity || item.requested_qty} 
                    </div>
                    <div className="col-span-2 p-1 border-b text-left text-[8pt]">
                      {request.request_remark || "N/A"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-11 p-2 text-center text-sm">
                  No items listed.
                </div>
              )}

              {/* Ensure table has space/lines if data is sparse */}
              {requested_items &&
                requested_items.length < 5 &&
                Array(5 - requested_items.length)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="grid grid-cols-11 text-center h-8"
                    >
                      <div className="col-span-1 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-3 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-1 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-1 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-1 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-1 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-1 border-r border-gray-900 p-1 border-b"></div>
                      <div className="col-span-2 p-1 border-b"></div>
                    </div>
                  ))}
            </div>
          </div>
          {/* Notice/Remark Box below Item Table */}
          <div className="flex text-sm mb-8 ms-[55px] items-start">
            {/* Label Section */}
            <p className="font-bold text-lg me-2">
              ማስታወሻ
              <br />
              Notice
            </p>

            {/* Value Section (boxed) */}
            <div className="w-full border border-gray-900 p-2 break-words whitespace-pre-wrap rounded-sm">
              {request_remark || "N/A"}
            </div>
          </div>

          {/* --- SIGNATURES / STATUS LOGS (Request & Approval) --- */}
          <div className="mb-6">
            {/* Financial Summary and Amount in Words */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-900 p-2 text-sm">
                <p className="font-bold mb-1">Amount in Words:</p>
                <p className="border-b border-dotted border-gray-900 min-h-6">
                  {amount_in_words || "N/A"}
                </p>
              </div>
              <div className="border border-gray-900 p-2 text-sm">
                <p className="font-bold text-base mb-1">Financial Summary</p>
                <FinancialLine label="Subtotal (Excl VAT)" value={subtotal} />
                <FinancialLine label="Total VAT" value={total_vat} />
                <div className="border-t border-gray-400 mt-1 pt-1">
                  <FinancialLine
                    label="Grand Total (Inc. VAT)"
                    value={total_price_including_vat}
                    isTotal
                  />
                </div>
              </div>
            </div>

            {/* Signature Grid (Simplified) */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {/* Requested By (Request/Originator Box) */}
              <SketchSignatureBox
                title="የጠየቀው (Requested by)"
                name={request.requested_by}
                dept={request.requested_department}
                status={request.status} // Use the single status field
                date={request.date}
                storeBranch={request.requested_from} // Using requested_from for 'Store Name/Branch' line
              />

              {/* Approved By (Approval Box) */}
              <SketchSignatureBox
                title="ያፀደቀው (Approved by)"
                name={request.approved_name || request.approved_by}
                dept={request.approved_dept}
                status={request.status}
                date={request.approved_date}
                remark={request.approved_remark}
              />
              
              {/* Removed Delivered/Issued and Received By boxes */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Helper Components ---

const FinancialLine = ({ label, value, isTotal = false }) => (
  <div
    className={`flex justify-between text-sm ${
      isTotal ? "font-bold text-gray-900" : "text-gray-700"
    }`}
  >
    <span>{label}:</span>
    <span>${(parseFloat(value) || 0).toFixed(2)}</span>
  </div>
);

// Helper component matching the sketch's signature box layout
const SketchSignatureBox = ({
  title,
  name,
  dept,
  status,
  date,
  remark,
  storeBranch, // Used for requested_from
}) => {
  const statusText = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    : "N/A";
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US")
    : "N/A";

  return (
    <div className="border border-gray-900 p-2 rounded text-sm print:text-xs">
      {/* Primary Title */}
      <p className="font-bold border-b border-dotted border-gray-400 mb-2 pb-1">
        {title}
      </p>

      {/* The Sketch Fields */}
      <div className="grid grid-cols-2 gap-2">
        {/* Store/Branch is only relevant for the first box (requested from) */}
        {storeBranch && (
          <div className="col-span-2 flex justify-between">
            <span className="font-semibold">Store name/Branch:</span>
            <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
              {storeBranch}
            </span>
          </div>
        )}

        <div className="col-span-2 flex justify-between">
          <span className="font-semibold">Name/Signature:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {name}
          </span>
        </div>

        <div className="flex justify-between col-span-1">
          <span className="font-semibold">Dept/Position:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {dept}
          </span>
        </div>

        <div className="flex justify-between col-span-1">
          <span className="font-semibold">Date:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {formattedDate}
          </span>
        </div>

        <div className="flex justify-between col-span-1">
          <span className="font-semibold">Status:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {statusText}
          </span>
        </div>

        <div className="flex justify-between col-span-1">
          <span className="font-semibold">Remark:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {remark || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};


export default StoreRequestPrint;