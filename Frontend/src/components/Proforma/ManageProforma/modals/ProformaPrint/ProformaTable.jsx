import React from "react";

// Format helper
function formatValue(value, field) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === 0 ||
    value === "0"
  ) {
    return field === "qty" || field === "est_time" ? "0" : "0.00";
  }

  if (field === "qty" || field === "est_time") {
    return isNaN(value) ? value : Number(value);
  }

  return isNaN(value)
    ? value
    : Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}

function cleanItems(items) {
  return (items || []).filter((item) => {
    const values = Object.entries(item).filter(
      ([key]) =>
        !["id", "proforma_id", "created_at", "updated_at"].includes(key)
    );
    return values.some(([_, val]) => val && val !== "0" && val !== "0.00");
  });
}

function TableSection({
  title,
  items,
  type,
  vatFlag,
  hideTitle,
  singleTable,
  proforma,
}) {
  if (!items || items.length === 0) return null;

  const subtotal = items.reduce((sum, i) => sum + Number(i.total || 0), 0);
  const vatAmount = vatFlag ? subtotal * 0.15 : 0;
  const totalWithVat = subtotal + vatAmount;

  // Refined width scheme for better balance
  const colStyles = {
    sNo: "w-[9%]",
    desc: "w-[36%]",
    unit: "w-[12%]",
    qtycost: "w-[15%]",
    unitprice: "w-[23%]",
    total: "w-[20%]",
  };

  return (
    <div
      className={`overflow-x-auto border border-black bg-white ${
        hideTitle ? "mt-0" : "mt-[2px]"
      }`}
    >
      {!hideTitle && (
        <h4 className="font-semibold text-[13px] text-gray-700 mb-[2px] px-1">
          {title}
        </h4>
      )}

      <table className="w-full table-fixed text-[16px] border-collapse border border-black leading-tight">
        <colgroup>
          <col className={colStyles.sNo} />
          <col className={colStyles.desc} />
          <col className={colStyles.unit} />
          <col className={colStyles.qtycost} />
          <col className={colStyles.unitprice} />
          <col className={colStyles.total} />
        </colgroup>

        <thead>
          <tr className="text-center">
            <th className="border border-black px-1 py-[3px] font-bold">
              ተ.ቁ <br />
              <span className="text-[14px] text-blue-700">S.No</span>
            </th>
            <th className="border border-black px-1 py-[3px] font-bold">
              መግለጫ <br />
              <span className="text-[14px]">Description</span>
            </th>
            <th className="border border-black px-1 py-[3px] font-bold">
              መለኪያ <br />
              <span className="text-[14px]">Unit</span>
            </th>

            {type === "labour" ? (
              <>
                <th className="border border-black px-1 py-[3px] font-bold">
                  ዋጋ <br />
                  <span className="text-[14px]">Cost</span>
                </th>
                <th className="border border-black px-1 py-[3px] font-bold">
                  ጊዜ <br />
                  <span className="text-[14px]">Est Time</span>
                </th>
              </>
            ) : (
              <>
                <th className="border border-black px-1 py-[3px] font-bold">
                  ብዛት <br />
                  <span className="text-[14px]">Qty</span>
                </th>
                <th className="border border-black px-1 py-[3px] font-bold">
                  የአንዱ ዋጋ <br />
                  <span className="text-[14px]">Unit Price</span>
                </th>
              </>
            )}

            <th className="border border-black px-1 py-[3px] font-bold">
              ጠቅላላ ዋጋ <br />
              <span className="text-[14px]">Total</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="px-1 py-[4px] text-center">{idx + 1}</td>
              <td className="px-1 py-[4px] align-top">
                {item.description?.includes("\n") ? (
                  <ul className="list list-inside space-y-1">
                    {item.description
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line, index) => (
                        <li key={index}>{line}</li> // KEEP original text
                      ))}
                  </ul>
                ) : (
                  <span>{item.description}</span>
                )}
              </td>

              <td className="px-1 py-[4px] text-center">{item.unit}</td>

              {type === "labour" ? (
                <>
                  <td className="px-1 py-[4px] text-center">
                    {formatValue(item.cost)}
                  </td>
                  <td className="px-1 py-[4px] text-center">
                    {formatValue(item.est_time, "est_time")}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-1 py-[4px] text-center">
                    {formatValue(item.qty, "qty")}
                  </td>
                  <td className="px-1 py-[4px] text-center">
                    {formatValue(item.unit_price)}
                  </td>
                </>
              )}

              <td className="px-1 py-[4px] text-right">
                {formatValue(item.total)}
              </td>
            </tr>
          ))}

          {/* Footer when single table */}

          {singleTable && (
            <>
              <tr>
                {/* In Words cell spans 3 rows to align with the 3 total rows */}
                <td
                  rowSpan={3}
                  colSpan={4}
                  className="italic text-[16px] pl-2 align-top border border-black whitespace-pre-line align-top"
                >
                  በፊደል / In Words:{" "}
                  <span className="font-bold">
                    {proforma.net_pay_in_words || "Zero Birr only"}
                  </span>
                </td>

                {/* Subtotal */}
                <td className="border border-black px-2 py-[5px] text-right align-top">
                  <div className="font-bold leading-tight text-[14px]">
                    ጠቅላላ ድምር /
                    <span className="text-[14px] font-bold">Subtotal</span>
                  </div>
                </td>
                <td className="border border-black px-2 py-[5px] text-right align-top">
                  {formatValue(subtotal)}
                </td>
              </tr>

              {/* VAT */}
              <tr>
                <td className="border border-black px-2 py-[4px] text-right align-top">
                  <div className="font-bold leading-tight">
                    ተ.እ.ታ /
                    <span className="text-[14px] font-bold">VAT (15%)</span>
                  </div>
                </td>
                <td className="border border-black px-2 py-[4px] text-right align-top">
                  {formatValue(vatAmount)}
                </td>
              </tr>

              {/* Total Incl. VAT */}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black px-0 py-[5px] text-right align-top">
                  <div className="font-bold leading-tight">
                    ጠ. ዋጋ ተ.እ.ታ ጨምሮ
                    <br />
                    <span className="text-[14ssspx] font-bold">
                      Tot.Price Incl.VAT
                    </span>
                  </div>
                </td>
                <td className="border border-black px-2 py-[5px] text-right align-top">
                  {formatValue(totalWithVat)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ProformaTable({ proforma }) {
  const labourItems = cleanItems(proforma.labour_items);
  const spareItems = cleanItems(proforma.spare_items);

  const tables = [
    {
      title: "Labour Costs / የእጅ ዋጋ",
      items: labourItems,
      type: "labour",
      vatFlag: proforma.labour_vat === 1,
    },
    {
      title: "Spare Items / የመለዋወጫ እቃዎች",
      items: spareItems,
      type: "spare",
      vatFlag: proforma.spare_vat === 1,
    },
  ];

  const tablesWithData = tables.filter((t) => t.items.length > 0);
  const singleTable = tablesWithData.length === 1;

  // ✅ Final totals moved here (this is the fix)
  // Calculate subtotal per section
  const labourSubtotal = labourItems.reduce(
    (sum, i) => sum + Number(i.total || 0),
    0
  );
  const spareSubtotal = spareItems.reduce(
    (sum, i) => sum + Number(i.total || 0),
    0
  );

  // VAT only for sections that have vatFlag = true
  const labourVat = proforma.labour_vat === 1 ? labourSubtotal * 0.15 : 0;
  const spareVat = proforma.spare_vat === 1 ? spareSubtotal * 0.15 : 0;

  // Final totals
  const finalSubtotal = labourSubtotal + spareSubtotal;
  const finalVat = labourVat + spareVat;
  const finalTotal = finalSubtotal + finalVat;

  return (
    <div className="space-y-[3px]">
      {tablesWithData.map((t, idx) => (
        <TableSection
          key={idx}
          title={t.title}
          items={t.items}
          type={t.type}
          vatFlag={t.vatFlag}
          hideTitle={singleTable}
          singleTable={singleTable}
          proforma={proforma}
        />
      ))}

      {/* ✅ Single correct final summary for multiple tables */}
      {tablesWithData.length > 1 && (
        <table className="w-full border-collapse mt-2 text-[12px] table-fixed">
          <colgroup>
            <col style={{ width: "60%" }} /> {/* In Words section */}
            <col style={{ width: "22%" }} /> {/* Label (Subtotal, VAT, etc.) */}
            <col style={{ width: "18%" }} /> {/* Value */}
          </colgroup>

          <tbody>
            {/* Subtotal row */}
            <tr>
              <td
                rowSpan={3}
                className="italic text-[16px] pl-2 border border-black align-top leading-snug"
              >
                በፊደል / In Words:{" "}
                <span className="font-semibold">
                  {proforma.net_pay_in_words || "Zero Birr only"}
                </span>
              </td>

              <td className="border border-black text-[14px] text-left font-bold px-2">
                ጠቅላላ ድምር /
                <span className="text-[14px] font-bold">Subtotal</span>
              </td>
              <td className="border border-black text-[14px] text-right font-bold px-2">
                {formatValue(finalSubtotal)}
              </td>
            </tr>

            {/* VAT row */}
            <tr>
              <td className="border border-black text-[14px] text-left font-bold px-2">
                ተ.እ.ታ /<span className="text-[14px] font-bold">VAT (15%)</span>
              </td>
              <td className="border border-black text-[14px] text-right font-bold px-2">
                {formatValue(finalVat)}
              </td>
            </tr>

            {/* Total row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black text-[14px] text-left font-extrabold px-2">
                ጠ.ዋጋ ተ.እ.ታ ጨምሮ
                <br />
                <span className="text-[14px] font-extrabold">
                  Tot.Price Incl.VAT
                </span>
              </td>
              <td className="border border-black text-[14px] text-right px-2 font-extrabold">
                {formatValue(finalTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
