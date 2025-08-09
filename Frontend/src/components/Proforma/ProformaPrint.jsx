// src/pages/ProformaPrint.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useStores } from "@/contexts/storeContext";
import api from "@/api";

export default function ProformaPrint() {
  const { id } = useParams();
  const { companyData } = useStores();
  const [proforma, setProforma] = useState(null);
  //    const { id } = useParams();
  const [searchParams] = useSearchParams();
  //   const { companyData } = useStores();
  //   const [proforma, setProforma] = useState(null);

  useEffect(() => {
    const fetchProforma = async () => {
      try {
        const { data } = await api.get(`/proformas/${id}`);
        setProforma(data.data);
      } catch (err) {
        console.error("Error fetching proforma:", err);
      }
    };
    fetchProforma();
  }, [id]);

  useEffect(() => {
    if (proforma && searchParams.get("print") === "true") {
      setTimeout(() => {
        window.print();
        window.close(); // auto-close after print if in new tab
      }, 500);
    }
  }, [proforma, searchParams]);
  if (!proforma) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-10 bg-white text-black min-h-screen">
      {/* Company Header */}
      <div className="flex items-start justify-between border-b pb-4 mb-4">
        <div>
          {companyData?.logo && (
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/${
                companyData.logo
              }`}
              alt="Company Logo"
              className="h-16 mb-2"
            />
          )}
          <h1 className="text-xl font-bold">{companyData?.name}</h1>
          <p>{companyData?.address}</p>
          <p>
            Phone: {companyData?.phone} | Email: {companyData?.email}
          </p>
        </div>
        <div className="text-right">
          <p>
            <strong>No:</strong> {proforma.id}
          </p>
          <p>
            <strong>Date:</strong> {proforma.date}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <p>
          <strong>Customer:</strong> {proforma.customer_name}
        </p>
        <p>
          <strong>Product Name:</strong> {proforma.product_name}
        </p>
        <p>
          <strong>Type of Job:</strong> {proforma.types_of_jobs}
        </p>
        <p>
          <strong>Prepared By:</strong> {proforma.prepared_by}
        </p>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">No.</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Material Cost</th>
            <th className="border p-2">Labor Cost</th>
            <th className="border p-2">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {proforma.items.map((item, index) => (
            <tr key={item.id}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2">{item.description}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-right">{item.material_cost}</td>
              <td className="border p-2 text-right">{item.labor_cost}</td>
              <td className="border p-2 text-right">{item.total_cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6 text-right">
        <p>
          <strong>Sub Total:</strong> {proforma.net_total}
        </p>
        <p>
          <strong>VAT 15%:</strong> {(proforma.net_total * 0.15).toFixed(2)}
        </p>
        <p>
          <strong>Gross Total:</strong> {(proforma.net_total * 1.15).toFixed(2)}
        </p>
        <p>
          <strong>Withholding 2%:</strong>{" "}
          {(proforma.net_total * 0.02).toFixed(2)}
        </p>
        <p>
          <strong>Net Pay:</strong>{" "}
          {(proforma.net_total * 1.15 - proforma.net_total * 0.02).toFixed(2)}
        </p>
      </div>

      {/* Footer Notes */}
      <div className="mt-10 text-sm">
        <p>I have agreed with the above price.</p>
        <p>Validity: 15 working days.</p>
        <p>Payment before vehicle release.</p>
        <p>Delivery Time: {proforma.delivery_time}</p>
        <p>Prepared By: {proforma.prepared_by}</p>
      </div>
    </div>
  );
}
