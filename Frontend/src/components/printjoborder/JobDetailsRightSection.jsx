import React from "react";
import { IoMdArrowDropright } from "react-icons/io";

const JobDetailsRightSection = ({ printData }) => {
  const customerLength = printData?.customer_observation?.length || 0;
  const jobLength = printData?.job_description?.length || 0;
  const spareLength = printData?.spare_change?.length || 0;

  const totalJobPrice = printData?.job_description?.reduce(
    (acc, curr) => acc + (parseFloat(curr?.price) || 0),
    0
  );

  const totalSparePrice = printData?.spare_change?.reduce(
    (acc, curr) => acc + (parseFloat(curr?.total_price) || 0),
    0
  );

  return (
    <div className="w-full px-4 text-xs font-sans text-black print:text-black">
      {/* Header Information */}
      <div className="grid grid-cols-2 gap-4 border p-2 mb-4 text-[11px]">
        <div>
          <p>
            <strong>Job ID:</strong> {printData?.job_id}
          </p>
          <p>
            <strong>Customer Name:</strong> {printData?.customer_name}
          </p>
          <p>
            <strong>Phone:</strong> {printData?.mobile}
          </p>
          <p>
            <strong>Received Date:</strong>{" "}
            {printData?.received_date
              ? new Date(printData.received_date).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })
              : ""}
          </p>

          <p>
            <strong>Promise Date:</strong>{" "}
            {printData?.promise_date
              ? new Date(printData.promise_date).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })
              : ""}
          </p>
        </div>
        <div>
          <p>
            <strong>Status:</strong> {printData?.status}
          </p>
          <p>
            <strong>Product Name:</strong> {printData?.product_name}
          </p>
          <p>
            <strong>Serial/Code:</strong> {printData?.serial_code}
          </p>
          <p>
            <strong>Type of Job:</strong> {printData?.types_of_jobs}
          </p>
        </div>
      </div>

      {/* Job Description and Customer Observation */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <h2 className="font-bold mb-1 text-[12px]">Customer Observation</h2>
          <table className="w-full border border-collapse text-[11px]">
            <thead className="bg-gray-200 text-center font-semibold text-[11px]">
              <tr>
                <th className="border p-1">Observation</th>
              </tr>
            </thead>
            <tbody>
              {printData?.customer_observation?.map((obs, i) => (
                <tr key={i}>
                  <td className="border p-1 align-top">{obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="font-bold mb-1 text-[12px]">Jobs To Be Done</h2>
          <table className="w-full border border-collapse text-[11px]">
            <thead className="bg-gray-200 font-semibold text-center text-[11px]">
              <tr>
                <th className="border p-1">Description</th>
                <th className="border p-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {printData?.job_description?.map((job, i) => (
                <tr key={i}>
                  <td className="border p-1">{job.task}</td>
                  <td className="border p-1 text-right">{job.price} ETB</td>
                </tr>
              ))}
              <tr>
                <td className="border p-1 text-right font-semibold">Total</td>
                <td className="border p-1 text-right font-semibold">
                  {totalJobPrice.toFixed(2)} ETB
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Spare Parts Table */}
      <div className="mb-4">
        <h2 className="font-bold mb-1 text-[12px]">Spare Parts</h2>
        <table className="w-full border border-collapse text-[11px]">
          <thead className="bg-gray-200 font-semibold text-center">
            <tr>
              <th className="border p-1">Item</th>
              <th className="border p-1">Part #</th>
              <th className="border p-1">Qty</th>
              <th className="border p-1">Unit Price</th>
              <th className="border p-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {printData?.spare_change?.map((spare, i) => (
              <tr key={i}>
                <td className="border p-1">{spare.item}</td>
                <td className="border p-1">{spare.part_number}</td>
                <td className="border p-1">{spare.qty}</td>
                <td className="border p-1">{spare.unit_price}</td>
                <td className="border p-1 text-right">
                  {spare.total_price} ETB
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} className="border p-1 text-right font-semibold">
                Total
              </td>
              <td className="border p-1 text-right font-semibold">
                {totalSparePrice.toFixed(2)} ETB
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Workshop Notice Section */}
      <div className="mt-4 text-[11px]">
        <h2 className="text-center font-bold text-black text-[12px] mb-2">
          Workshop Service Terms & Conditions
        </h2>
        <ul className="space-y-1 pl-3">
          <li className="flex">
            <IoMdArrowDropright className="mt-[2px]" size={12} />
            <p className="ml-2">
              Please make sure you{" "}
              <span className="font-semibold">keep your receipt slip</span> for
              the property submitted for repair.
            </p>
          </li>
          <li className="flex">
            <IoMdArrowDropright className="mt-[2px]" size={12} />
            <p className="ml-2">
              Provide any required spare parts promptly when requested, to avoid
              delay.
            </p>
          </li>
          <li className="flex">
            <IoMdArrowDropright className="mt-[2px]" size={12} />
            <p className="ml-2">
              Once your repair is completed, we will notify you. Please collect
              your property by appointment.
            </p>
          </li>
          <li className="flex">
            <IoMdArrowDropright className="mt-[2px]" size={12} />
            <p className="ml-2">
              Property must be collected at the{" "}
              <span className="font-semibold">first notification</span> after
              repair completion.
            </p>
          </li>
          <li className="flex">
            <IoMdArrowDropright className="mt-[2px]" size={12} />
            <p className="ml-2">
              If the property is not collected on time, an additional{" "}
              <span className="font-semibold">storage fee</span> will be
              charged.
            </p>
          </li>
        </ul>
        <p className="text-center font-semibold mt-3">
          Thank you for choosing our workshop for your service needs.
        </p>
      </div>
    </div>
  );
};

export default JobDetailsRightSection;
