import React from "react";

function TableSection({ title, items, type }) {
  // If no items are available, show a message
  if (!items || items.length === 0)
    return (
      <div className="text-center text-gray-500 my-6">
        No data available for {title}
      </div>
    );

  return (
    <>
      <h4 className="mt-6 mb-3 font-semibold text-xl text-gray-700">{title}</h4>
      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-300 text-gray-900">
            <tr className="text-left">
              <th className="border-b py-2 px-4 font-semibold">No</th>
              <th className="border-b py-2 px-4 font-semibold">Description</th>
              <th className="border-b py-2 px-4 font-semibold">Unit</th>
              {type === "labour" ? (
                <>
                  <th className="border-b py-2 px-4 font-semibold">Cost</th>
                  <th className="border-b py-2 px-4 font-semibold">Est Time</th>
                </>
              ) : (
                <>
                  <th className="border-b py-2 px-4 font-semibold">Brand</th>
                  <th className="border-b py-2 px-4 font-semibold">Qty</th>
                  <th className="border-b py-2 px-4 font-semibold">
                    Unit Price
                  </th>
                </>
              )}
              <th className="border-b py-2 px-4 font-semibold">Total Price</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item, index) => (
              <tr
                key={item.id || index}
                className={`border-t ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-2 px-4 text-left">{index + 1}</td>
                <td className="py-2 px-4">{item.description || "---"}</td>
                <td className="py-2 px-4">{item.unit || "---"}</td>
                {type === "labour" ? (
                  <>
                    <td className="py-2 px-4 text-left">
                      {item.cost || "0.00"}
                    </td>
                    <td className="py-2 px-4 text-left">
                      {item.est_time || "0.00"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-4">{item.brand || "---"}</td>
                    <td className="py-2 px-4 text-left">{item.qty || "0"}</td>
                    <td className="py-2 px-4 text-left">
                      {item.unit_price || "0.00"}
                    </td>
                  </>
                )}
                <td className="py-2 px-4 text-left">
                  {item.total || item.total_price || "0.00"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProformaTable({ proforma }) {
  return (
    <div className="space-y-6">
      <TableSection
        title="Labour "
        items={proforma.labour_items}
        type="labour"
      />
      <TableSection
        title="Spare Items"
        items={proforma.spare_items}
        type="spare"
      />
    </div>
  );
}

export default ProformaTable;
