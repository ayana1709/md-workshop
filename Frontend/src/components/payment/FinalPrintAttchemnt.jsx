/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "@/api";
import numberToWords from "number-to-words";
import PrintHeader from "../PrintHeader";
import { useStores } from "@/contexts/storeContext";
import { useReactToPrint } from "react-to-print";

function FinalPrintAttachment() {
  const { jobId } = useParams();
  const [payment, setPayment] = useState(null);
  const { companyData } = useStores();

  // ✅ REF FOR PRINTING
  const printRef = useRef(null);

  // ✅ REACT-TO-PRINT HANDLER (latest version)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `AttachmentCompany_${jobId}`,
  });

  useEffect(() => {
    if (!jobId) return;
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/job/${jobId}`);
        setPayment(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        console.error("❌ Failed to fetch payment:", err);
      }
    };
    fetchPayment();
  }, [jobId]);

  if (!payment) return <p className="p-4">Loading payment details...</p>;

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatQty = (value) => {
    const num = Number(value || 0);
    return num % 1 === 0
      ? num
      : num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const labourTotal =
    payment?.labourCosts?.reduce(
      (sum, row) => sum + (Number(row.total) || 0),
      0
    ) || 0;
  const spareTotal =
    payment?.spareCosts?.reduce(
      (sum, row) => sum + (Number(row.total) || 0),
      0
    ) || 0;
  const otherTotal =
    payment?.otherCosts?.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0
    ) || 0;

  const calculatedSubtotal = labourTotal + spareTotal + otherTotal;
  const vatAmount = payment?.summary?.vatAmount ?? 0;
  const grandTotal =
    (payment?.summary?.grandTotal ?? calculatedSubtotal + Number(vatAmount)) ||
    0;
  const remainingAmount = (
    parseFloat(payment?.summary?.grandTotal || 0) -
    parseFloat(payment?.paidAmount || 0)
  ).toFixed(2);

  const hasValidData = (data) =>
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((row) =>
      Object.values(row || {}).some(
        (val) => val !== null && val !== undefined && val !== ""
      )
    );

  const sections = [
    {
      title: "Labour Costs / የእጅ ዋጋ",
      data: payment.labourCosts,
      headers: [
        { am: "ተ.ቁ", en: "S.No", key: "sno" },
        { am: "መግለጫ", en: "Description", key: "description" },

        { am: "መለኪያ", en: "Unit", key: "time" },
        { am: "ጠቅላላ ዋጋ", en: "Total", key: "total" },
      ],
      totalKey: "total",
      fallback: payment.summary?.labourTotal,
    },
    {
      title: "Spare Parts / የመለዋወጫ እቃዎች",
      data: payment.spareCosts,
      headers: [
        { am: "ተ.ቁ", en: "S.No", key: "sno" },
        { am: "መግለጫ", en: "Description", key: "description" },
        { am: "መለኪያ", en: "Unit", key: "unit" },
        { am: "ብዛት", en: "Qty", key: "qty" },
        { am: "የአንዱ ዋጋ", en: "Price", key: "price" },
        { am: "ጠቅላላ ዋጋ", en: "Total", key: "total" },
      ],
      totalKey: "total",
      fallback: payment.summary?.spareTotal,
    },
    {
      title: "Other Costs / ሌሎች ዋጋዎች",
      data: payment.otherCosts,
      headers: [
        { am: "ተ.ቁ", en: "S.No", key: "sno" },
        { am: "መግለጫ", en: "Description", key: "description" },
        { am: "መጠን", en: "Amount", key: "amount" },
      ],
      totalKey: "amount",
      fallback: payment.summary?.otherTotal,
    },
  ];

  const nonEmptySections = sections.filter((section) =>
    hasValidData(section.data)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-30 print:bg-transparent print:inset-auto">
      <div className="bg-white w-auto max-h-[95vh] overflow-y-auto rounded-md shadow-lg p-6 relative print:p-0 print:shadow-none print:rounded-none print:overflow-visible">
        {/* ✅ PRINT BUTTON */}
        <div className="text-center mb-4 no-print">
          <button
            onClick={handlePrint}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg text-[14px] font-semibold shadow hover:bg-blue-800 transition-all"
          >
            🖨️ Print Page
          </button>
        </div>

        {/* ✅ PRINTABLE AREA */}
        <div
          ref={printRef}
          className="print-area text-black font-sans bg-white w-[380mm] mx-auto overflow-visible print:w-full text-[21px] leading-relaxed relative"
          style={{ pageBreakInside: "avoid" }}
        >
          {/* ✅ WATERMARK */}
          <div
            className="absolute inset-0 flex  items-center font-black pointer-events-none select-none whitespace-nowrap w-[380mm]  print:w-full"
            style={{
              transform: "rotate(-40deg)",
              color: "#000",
              opacity: 0.4,
              fontSize: "12vw",
              letterSpacing: "1vw",
              lineHeight: 1,
              zIndex: 10,
            }}
          >
            ATTACHMENT
          </div>

          {/* ✅ FULL ORIGINAL CONTENT HERE */}
          <div className="relative z-10">
            <PrintHeader />

            <h2 className="text-center text-3xl font-extrabold underline mt-4 mb-6 tracking-wide">
              የእጅ በእጅ ሽያጭ አባሪ
              <br />
              ATTACHEMNT CASH SALES
            </h2>

            <div className="border border-gray-700 rounded-lg p-3 text-[19px] font-semibold leading-tight">
              <div className="grid grid-cols-[40%_30%_30%] gap-x-4">
                {/* Supplier Info */}
                <div className="truncate">
                  <p className="font-bold mb-1 ml-1 inline-block break-words">
                    From / ከ : {companyData?.name_en || "—"}
                  </p>

                  <div className="ml-3 space-y-[2px]">
                    <p className="truncate">
                      TIN No / ታስክ.ከ.መ.ቁ፡{" "}
                      <span className="font-bold">
                        {companyData?.tin || "—"}
                      </span>
                    </p>
                    <p className="truncate">
                      VAT Reg. No / ተ.እ.ታ.መ.ቁ፡{" "}
                      <span className="font-bold">
                        {companyData?.vat || "—"}
                      </span>
                    </p>
                    <p className="truncate">
                      VAT Reg. Date / የተ.እ.ታ የተመ.ቀን፡{" "}
                      <span className="font-bold">
                        {companyData?.established || "—"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="truncate">
                  <p className="font-bold mb-1">
                    To / ለ :{" "}
                    <span className="font-bold ml-1 truncate inline-block max-w-[180px] align-middle">
                      {payment?.name || "—"}
                    </span>
                  </p>
                  <div className="ml-3 space-y-[2px]">
                    <p className="truncate">
                      TIN No / ታስክ.ከ.መ.ቁ፡{" "}
                      <span className="font-bold">{payment?.tin || "—"}</span>
                    </p>
                    <p className="truncate">
                      VAT Reg. No / ተ.እ.ታ.መ.ቁ፡{" "}
                      <span className="font-bold">{payment?.vat || "—"}</span>
                    </p>
                  </div>
                </div>

                {/* Date + Ref + FS Column */}
                <div className="space-y-[2px] truncate mt-[2px]">
                  <p className="truncate">
                    Date / ቀን፡{" "}
                    <span className="font-bold">
                      {payment?.date
                        ? new Date(payment.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </p>
                  <p className="truncate">
                    Ref No / የመ.ቁ፡{" "}
                    <span className="font-bold">
                      {payment?.reference || "—"}
                    </span>
                  </p>
                  <p className="truncate">
                    FS No / ኤፍ.ኤስ.ቁ፡{" "}
                    <span className="font-bold">{payment?.fs || "—"}</span>
                  </p>
                  <p className="truncate">
                    Mobile / ሞባይል፡{" "}
                    <span className="font-bold">{payment?.mobile || "—"}</span>
                  </p>
                </div>
              </div>
            </div>

            {nonEmptySections.map((section, idx) => {
              const sectionTotal =
                section.fallback ??
                section.data.reduce(
                  (sum, row) => sum + (Number(row[section.totalKey]) || 0),
                  0
                );

              // Helper to split integer and cents for styling
              const splitPrice = (val) => {
                const [intPart, centsPart = "00"] = formatPrice(val).split(".");
                return { intPart, centsPart };
              };

              return (
                <div key={idx} className="mt-6 print:break-inside-avoid">
                  {nonEmptySections.length > 1 && (
                    <h3 className="font-extrabold text-[22px] mb-3 border-b border-gray-500">
                      {section.title}
                    </h3>
                  )}
                  <table className="w-full border border-gray-600 text-[22px] table-fixed">
                    <thead>
                      <tr>
                        {section.headers.map((h, i) => {
                          const widthClass =
                            i === 0
                              ? "w-[74px]"
                              : h.en.toLowerCase().includes("description")
                              ? "w-auto"
                              : h.en.toLowerCase().includes("unit")
                              ? "w-[12%]"
                              : h.en.toLowerCase().includes("qty")
                              ? "w-[10%]"
                              : h.en.toLowerCase().includes("price")
                              ? "w-[20%]"
                              : h.en.toLowerCase().includes("total") ||
                                h.en.toLowerCase().includes("amount")
                              ? "w-[20%]"
                              : "w-auto";

                          return (
                            <th
                              key={i}
                              className={`border border-gray-600 px-1 py-0 text-center font-extrabold text-[18px] truncate ${widthClass}`}
                            >
                              <div>{h.am}</div>
                              <div className="text-[22px] font-normal">
                                {h.en}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {section.data.map((item, i) => (
                        <tr key={i}>
                          {/* S.No */}
                          <td
                            className="border border-gray-600 px-3 py-0 text-center "
                            style={{
                              width: "74px",
                              minWidth: "74px",
                              maxWidth: "74px",
                            }}
                          >
                            {i + 1}
                          </td>

                          {section.headers.slice(1).map((h, j) => {
                            const key = h.key;

                            // Use item[key], fallback to itemName for spare parts
                            let val =
                              item[key] ||
                              item[key.toLowerCase()] ||
                              item[key.toUpperCase()] ||
                              // Spare Parts fallbacks
                              (key === "unit" &&
                                (item.partNumber ||
                                  item.unit ||
                                  item.unitName)) ||
                              (key === "qty" && (item.quantity || item.Qty)) ||
                              (key === "price" &&
                                (item.cost || item.amount || item.unitPrice)) ||
                              (key === "total" &&
                                (item.Total || item.totalAmount)) ||
                              // Labour fallbacks
                              (key === "time" &&
                                (item.hour || item.hours || item.timeTaken)) ||
                              // Default empty
                              "";

                            if (
                              key === "description" &&
                              !val &&
                              item.itemName
                            ) {
                              val = item.itemName;
                            }

                            const isQty = h.en.toLowerCase().includes("qty");
                            const isTotal =
                              h.en.toLowerCase().includes("total") ||
                              h.en.toLowerCase().includes("amount");
                            const isDescription =
                              h.en.toLowerCase().includes("description") ||
                              key === "description";

                            // MULTILINE SUPPORT: description or itemName (spare parts)
                            const isMultiLine =
                              (isDescription && item.isTextarea) ||
                              (key === "description" && item.isItemTextarea);

                            const displayValue =
                              typeof val === "number"
                                ? isQty
                                  ? formatQty(val)
                                  : formatPrice(val)
                                : val;

                            const { intPart, centsPart } = splitPrice(val || 0);

                            const widthClass = isDescription
                              ? "w-[40%] text-left align-top"
                              : h.en.toLowerCase().includes("unit")
                              ? "w-[8%] text-center"
                              : h.en.toLowerCase().includes("qty")
                              ? "w-[10%] text-center"
                              : h.en.toLowerCase().includes("price")
                              ? "w-[25%] text-center"
                              : isTotal
                              ? "w-[25%] text-right"
                              : "w-auto text-center";

                            return (
                              <td
                                key={j}
                                className={`border border-gray-600 px-3 py-1 ${widthClass} ${
                                  isTotal ? "font-semibold" : ""
                                } print-multiline`}
                              >
                                {isMultiLine &&
                                typeof displayValue === "string" ? (
                                  <div style={{ width: "100%" }}>
                                    {displayValue
                                      .split("\n")
                                      .map((line, idx) => (
                                        <div key={idx}>{line}</div>
                                      ))}
                                  </div>
                                ) : isTotal ? (
                                  <div className="inline-flex justify-right items-right gap-1">
                                    <span>{intPart}</span>
                                    <span className="bg-gray-200 text-gray-800 px-1 rounded">
                                      .{centsPart}
                                    </span>
                                  </div>
                                ) : (
                                  displayValue
                                )}
                                <style>
                                  @media print{" "}
                                  {`
  td.print-multiline div {
    white-space: pre-line !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    display: block !important;
  }`}
                                </style>
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* ---- TOTALS HANDLING FOR BOTH TABLE TYPES ---- */}
                      {nonEmptySections.length === 1 ? (
                        <>
                          <style>{`
        @media print {
          td.no-left-border-print { border-left: none !important; }
          td.in-words-print { vertical-align: top !important; height: 100% !important; }
        }
      `}</style>

                          <tr className="text-[20px] align-top">
                            <td
                              colSpan={section.headers.length - 2}
                              className="italic text-left px-1 py-0 border-none in-words-print"
                            >
                              In Words / በፊደል፡{" "}
                              <span className="font-bold">
                                {numberToWords.toWords(Number(grandTotal) || 0)}{" "}
                                birr only
                              </span>
                            </td>

                            <td className="text-right font-extrabold px-0 py-2 pr-1 border-t border-b border-r border-l border-gray-600 no-left-border-print">
                              Subtotal / ጠቅላላ ዋጋ
                            </td>
                            <td className="text-right font-extrabold px-2 py-2 border-t border-b border-gray-600 align-middle">
                              <div className="inline-flex justify-center items-center gap-1">
                                <span>
                                  {splitPrice(calculatedSubtotal).intPart}
                                </span>
                                <span className="bg-gray-200 text-gray-800 px-1 rounded">
                                  .{splitPrice(calculatedSubtotal).centsPart}
                                </span>
                              </div>
                            </td>
                          </tr>

                          <tr className="text-[19px]">
                            <td
                              colSpan={section.headers.length - 2}
                              className="px-1 py-2 border-none in-words-print"
                            ></td>
                            <td className="text-right font-extrabold px-0 py-2 border-t border-b border-r border-l border-gray-600 pr-1 no-left-border-print">
                              VAT / ተ.እ.ታ (15%)
                            </td>
                            <td className="text-right font-semibold px-2 py-2 border-t border-b border-gray-600 align-middle">
                              <div className="inline-flex justify-center items-center gap-1">
                                <span>{splitPrice(vatAmount).intPart}</span>
                                <span className="bg-gray-200 text-gray-800 px-1 rounded">
                                  .{splitPrice(vatAmount).centsPart}
                                </span>
                              </div>
                            </td>
                          </tr>

                          <tr className="text-[19px] font-extrabold">
                            <td
                              colSpan={section.headers.length - 2}
                              className="px-0 py-2 border-none in-words-print"
                            ></td>
                            <td className="text-right font-extrabold px-0 py-2 border-2 border-r border-gray-700 leading-tight pr-1 no-left-border-print">
                              <div>ጠ.ዋጋ ተ.እ.ታ ጨምሮ</div>
                              <div className="text-[19px] font-extrabold">
                                Tot.Price Incl.VAT
                              </div>
                            </td>
                            <td className="text-right font-extrabold px-0 py-2 border-2 border-gray-700 align-middle">
                              <div className="inline-flex justify-center items-center gap-1">
                                <span>{splitPrice(grandTotal).intPart}</span>
                                <span className="text-gray-900 px-1 rounded">
                                  .{splitPrice(grandTotal).centsPart}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr className="text-[17px] font-semibold">
                          <td
                            colSpan={section.headers.length - 1}
                            className="text-right px-2 py-2 border-t border-gray-700"
                          >
                            total / ጠቅላላ ድምር
                          </td>
                          <td className="text-center px-2 py-2 border-t border-gray-700 font-bold align-middle">
                            <div className="inline-flex justify-center items-center gap-1">
                              <span>{splitPrice(sectionTotal).intPart}</span>
                              <span className="bg-gray-200 text-gray-800 px-1 rounded">
                                .{splitPrice(sectionTotal).centsPart}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* ✅ Show overall summary only if more than one section is displayed */}
            {nonEmptySections.length > 1 && (
              <div
                className="flex justify-between mt-6 text-[20px] w-full print:mx-auto print:w-[95%]"
                style={{
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}
              >
                <div
                  className="italic font-medium text-[24px] "
                  style={{ width: "55%" }}
                >
                  In Words / በፊደል፡{" "}
                  <span className="font-bold">
                    {numberToWords.toWords(Number(grandTotal) || 0)} birr only
                  </span>
                </div>

                <div
                  className="text-right font-semibold mt-2"
                  style={{ width: "45%" }}
                >
                  <table className="print-summary-table w-full border border-gray-400 border-collapse table-fixed">
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 px-3 py-2 text-left w-[56%]">
                          Subtotal / ጠቅላላ ዋጋ
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-right w-[44%]">
                          {formatPrice(calculatedSubtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-3 py-2 text-left w-[56%]">
                          VAT / ተ.እ.ታ
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-right w-[44%]">
                          {formatPrice(vatAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-600 px-3 py-2 text-left text-[17px] font-extrabold w-[56%]">
                          T. price Incl VAT / ጠ.ዋጋ የተ.እ.ታ ጨሚሮ
                        </td>
                        <td className="border border-gray-600 px-3 py-2 text-right text-[17px] font-extrabold w-[44%]">
                          {formatPrice(grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- Payment Info --- */}
            <div className="border-t border-gray-700 mt-6 pt-3 grid grid-cols-2 gap-6 text-[22px]">
              <div className="space-y-1">
                <p>
                  Payment Method / የክፍያ ዘዴ፡{" "}
                  <span className="font-bold">{payment.method}</span>
                  {payment.method?.toLowerCase() === "cheque" &&
                    payment.chequeNumber && (
                      <span className="ml-2">
                        | Cheque No / የቸክ ቁጥር፡{" "}
                        <span className="font-bold">
                          {payment.chequeNumber}
                        </span>
                      </span>
                    )}
                </p>

                <p>
                  Status / ሁኔታ፡{" "}
                  <span className="font-bold">{payment.status}</span>
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p>
                  Paid Amount / የተከፈለ መጠን፡{" "}
                  <span className="font-bold">
                    {formatPrice(payment.paidAmount)}
                  </span>
                </p>
                <p>
                  Remaining / ቀሪ መጠን፡{" "}
                  <span className="font-bold">
                    {formatPrice(remainingAmount)}
                  </span>
                </p>
              </div>
            </div>

            {/* --- Signatures --- */}
            <div className="flex justify-between mt-8 text-[18px] font-bold">
              <div className="text-center w-1/2">
                <p>________________________</p>
                <p className="mt-1">Buyer Signature / የገዢ ፊርማ</p>
              </div>
              <div className="text-center w-1/2">
                <p>________________________</p>
                <p className="mt-1">Seller Signature / የሻጭ ፊርማ</p>
              </div>
            </div>
          </div>
          <div className="print-footer mt-4 text-center text-[14px] font-semibold">
            <p>ይህ አባሪ ያለ ፊዚካል ወይም ተመላሽ ደረሰኝ ተቀባይነት አይኖረውም ።</p>
            <p>NB. INVALID WITHOUT FISCAL OR REFUND RECEIPT ATTACHED</p>

            <p className="mt-2 text-[16px] font-bold">
              ስለመረጡን እናመሰግናለን — Thanks for Choosing Us!!!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalPrintAttachment;
