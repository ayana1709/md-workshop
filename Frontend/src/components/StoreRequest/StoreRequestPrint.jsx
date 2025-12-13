import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import Swal from "sweetalert2";

import { Print } from "@mui/icons-material";
import PrintHeader from "../PrintHeader";

// Helper to format date to DD/MM/YYYY (GC)
const formatGCDate = (isoDate) => {
  if (!isoDate) return "N/A";
  try {
    // 1. Remove the time component (everything starting from 'T')
    const dateOnlyString = isoDate.split('T')[0]; // Result: "YYYY-MM-DD"

    // 2. Now split the clean date string
    const dateParts = dateOnlyString.split('-'); // Result: ["YYYY", "MM", "DD"]
    
    // 3. Reorder to DD/MM/YYYY
    if (dateParts.length === 3) {
      return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }
    return dateOnlyString;
  } catch (e) {
    return 'N/A';
  }
};


// --- Component Start ---

const StoreRequestPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);

  const fetchRequest = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await api.get(`/store-requests/${id}`);
      const requestData = response.data.data || response.data;

      setRequest(requestData);
    } catch (error) {
      console.error("Failed to load store request:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to load store request.",
      });
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

  // Destructure fields based on the StoreRequest Form/Model
  const {
    ref_no,
    date,
    objective_for,
    request_remark,
    requested_items,
    requested_department,
    requested_by,
    status,
  } = request;

  const requestDate = formatGCDate(date); // Use the cleaner formatting helper

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
          {/* --- DOCUMENT HEADER --- */}
          <div className="border border-gray-900 p-2">
            <PrintHeader />
          </div>

          <div className="p-4 mt-3 mb-4">
            {/* Top Row - Title and Reference */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <div className="relative inline-block">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    ከሰቶር የ ዕቃ ማውጫ ሰነድ
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

          {/* --- ITEMS TABLE (Updated for Item Name, Unit, Qty, Remark) --- */}
          <div className="mb-6">
            <div className="border border-gray-900">
              {/* Header Row - Columns adjusted for Request only fields */}
              <div className="grid grid-cols-11 font-bold text-center border-b border-gray-900 bg-gray-100">
                <div className="col-span-1 border-r border-gray-900 p-1">
                  S.N
                </div>
                <div className="col-span-5 border-r border-gray-900 p-1">
                  የእቃዎች ስም / Item Name
                </div>
                <div className="col-span-1 border-r border-gray-900 p-1">
                  መለኪያ / Unit
                </div>
                <div className="col-span-2 border-r border-gray-900 p-1">
                  የተጠ. ብዛት / Req. Qty
                </div>
                <div className="col-span-2 border-r border-gray-900 p-1">
                  ምርመራ / Remark
                </div>
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
                    <div className="col-span-5 border-r border-gray-900 p-1 border-b text-left">
                      {item.item_name || "N/A"}
                    </div>
                    <div className="col-span-1 border-r border-gray-900 p-1 border-b">
                      {item.unit || "N/A"}
                    </div>
                    <div className="col-span-2 border-r border-gray-900 p-1 border-b font-bold">
                      {item.quantity || "0"} 
                    </div>
                    <div className="col-span-2 p-1 border-b border-gray-900 text-left">
                      {item.remark || "N/A"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-11 p-2 text-center text-sm">
                  No items listed.
                </div>
              )}
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
              {request.objective_for || "N/A"}
            </div>
          </div>

          {/* --- SIGNATURES / STATUS LOGS (Request & Approval) --- */}
          <div className="mb-6">
            
            {/* REMOVED FINANCIAL SUMMARY SECTION */}

            {/* Signature Grid (Simplified) */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm">
              {/* Requested By (Request/Originator Box) */}
              <SketchSignatureBox
                title="የጠየቀው (Requested by)"
                name={request.requested_by}
                dept={request.requested_department}
                status={request.status} // Use the single status field
                date={request.date}
                // requested_from may not exist, so use a placeholder or remove if not needed.
                // Assuming it's used to specify WHICH store they requested from.
                storeBranch={request.requested_from || request.requested_department} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Helper Components ---

// REMOVED FinancialLine HELPER

// Helper component matching the sketch's signature box layout
const SketchSignatureBox = ({
  title,
  name,
  dept,
  date,
  remark,
}) => {
  const statusText = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    : "N/A";
  const formattedDate = formatGCDate(date);

  return (
    <div className="border border-gray-900 p-2 rounded text-sm print:text-xs">
      {/* Primary Title */}
      <p className="font-bold border-b border-dotted border-gray-400 mb-2 pb-1">
        {title}
      </p>

      {/* The Sketch Fields */}
      <div className="grid grid-cols-2 gap-2">       

        <div className="col-span-2 flex justify-between">
          <span className="font-semibold">Name/Signature:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {name || "__________________"}
          </span>
        </div>

        <div className="flex justify-between col-span-1">
          <span className="font-semibold">Dept/Position:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {dept || "__________________"}
          </span>
        </div>

        <div className="flex justify-between col-span-1">
          <span className="font-semibold">Date:</span>
          <span className="border-b border-dotted border-gray-700 flex-grow ml-2 text-right">
            {formattedDate}
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