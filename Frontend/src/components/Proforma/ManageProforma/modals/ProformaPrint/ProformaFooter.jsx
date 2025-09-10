import React from "react";
import { useStores } from "@/contexts/storeContext";

function ProformaFooter({ proforma }) {
  const { companyData } = useStores();

  return (
    <div className="mt-10 bg-gray-100 p-6 rounded-lg">
      {/* Totals */}
      <div className="flex justify-between border-b pb-4">
        <div className="w-1/2 text-sm ">
          <p className="font-bold border-t pt-1">
            Performa Validity:
            <span className="text-lg pl-2">
              {proforma.validity_date || "___"}
            </span>{" "}
            Days
          </p>
          <p className="font-bold border-t pt-1">
            ይህ ዋጋ ማቅረቢያ የሚያገለጊለው ለ
            <span className="text-lg pl-2">
              {proforma.validity_date || "___"}
            </span>
            ቀናት ብቻ ነው።
          </p>
          <p className="font-bold border-t pt-1">
            Date of Delivery:
            <span className="text-lg pl-2">
              {proforma.delivery_date || "_________"}
            </span>{" "}
          </p>
          <p className="font-bold border-t  pt-1">
            የማስረከቢያ ቀን:
            <span className="text-lg pl-2">
              {proforma.delivery_date || "_________"}
            </span>{" "}
          </p>
          <p className="font-bold border-t pt-1">
            Perpared By| ያዘጋጀው ስም :
            <span className="text-lg pl-2">
              {proforma.prepared_by || "_____________"}
            </span>{" "}
          </p>

          <p className="font-bold border-t pt-1">
            Signature| ፍርማ :
            <span className="text-lg pl-2">{"__________________"}</span>{" "}
          </p>
        </div>
        <div className="w-1/2 text-sm text-right">
          <p className="font-bold border-t pt-1">
            Total: <span className="font-semibold">{proforma.total} Birr</span>
          </p>

          <p className="font-bold border-t pt-1">
            VAT (15%):{" "}
            <span className="font-semibold">{proforma.total_vat} Birr</span>
          </p>
          <p className="font-bold border-t pt-1">
            OtherCost:{" "}
            <span className="font-semibold">{proforma.other_cost} Birr</span>
          </p>
          <p className="font-bold border-t pt-1">
            Discount:{" "}
            <span className="font-semibold">{proforma.discount} Birr</span>
          </p>
          <p className="font-bold border-t pt-1">
            Grand Total:{" "}
            <span className="text-lg">{proforma.net_pay} Birr</span>
          </p>
          <p className="font-bold border-t pt-1">
            In words:
            <span className="font-semibold">
              {proforma.net_pay_in_words || "Zero Birr"}
            </span>
          </p>
        </div>
      </div>

      {/* Footer Line */}
      <div className="text-center mt-4 text-xs text-gray-600">
        <p>Thank you for doing business with us!</p>
      </div>
    </div>
  );
}

export default ProformaFooter;
