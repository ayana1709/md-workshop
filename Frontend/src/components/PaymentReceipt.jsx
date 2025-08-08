// PaymentReceipt.jsx
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import QRCode from "qrcode";
import Barcode from "react-barcode";
import { useStores } from "@/stores"; // adjust path as needed

const PaymentReceipt = ({ saleData }) => {
  const printRef = useRef();
  const { companyData } = useStores();

  const companyInfo = {
    name: companyData?.name_en || "Company Name",
    phone: companyData?.phone || "Phone",
    address: companyData?.address || "Address",
    tin: companyData?.tin ? `TIN: ${companyData.tin}` : "TIN: -",
    logo: companyData?.logo
      ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
      : "",
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  // Generate QR
  const [qrCode, setQrCode] = React.useState("");
  React.useEffect(() => {
    if (saleData?.id) {
      QRCode.toDataURL(JSON.stringify(saleData)).then(setQrCode);
    }
  }, [saleData]);

  return (
    <div className="p-4">
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        ከታች ንብረቱን አትረፍ – Print Receipt
      </button>

      <div ref={printRef} className="w-[80mm] mx-auto text-[12px] font-sans">
        {/* HEADER */}
        <div className="text-center border-b pb-2">
          {companyInfo.logo && (
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              className="h-16 mx-auto mb-1"
            />
          )}
          <div className="font-bold text-sm">{companyInfo.name}</div>
          <div>{companyInfo.address}</div>
          <div>📞 {companyInfo.phone}</div>
          <div>{companyInfo.tin}</div>
        </div>

        {/* BODY */}
        <div className="py-2">
          <div className="text-center font-semibold border-b pb-1">
            የመክፈያ ማስረጃ | Payment Receipt
          </div>
          <div className="mt-2 space-y-1">
            <div>
              <strong>መክፈያ መለያ (ID):</strong> {saleData?.id}
            </div>
            <div>
              <strong>ቀን | Date:</strong>{" "}
              {new Date(saleData?.date || Date.now()).toLocaleString()}
            </div>
            <div>
              <strong>የተከፈለበት መንገድ | Payment Method:</strong>{" "}
              {saleData?.payment_method || "-"}
            </div>
            <div>
              <strong>የተከፈለ መጠን | Paid Amount:</strong>{" "}
              {saleData?.amount_paid?.toFixed(2)} ብር
            </div>
          </div>
        </div>

        {/* BARCODE & QR */}
        <div className="flex justify-between items-center mt-3 border-t pt-2">
          {qrCode && <img src={qrCode} alt="QR Code" className="h-16 w-16" />}
          {saleData?.id && (
            <Barcode
              value={saleData.id.toString()}
              width={1}
              height={40}
              fontSize={10}
              displayValue={false}
            />
          )}
        </div>

        {/* Signature / Stamp */}
        <div className="mt-4 border-t pt-2">
          <div className="h-16 border rounded-md flex items-end justify-between px-2">
            <div className="text-xs">የተፈረመ | Signature</div>
            <div className="text-xs">ማህተም | Stamp</div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-4 text-xs italic">
          አመሰግናለሁ | Thank you for your payment.
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
