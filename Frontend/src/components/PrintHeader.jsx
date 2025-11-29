/* eslint-disable react/prop-types */
import { useStores } from "@/contexts/storeContext";
import React, { useEffect, useRef, useState } from "react";

const PrintHeader = ({ className = "" }) => {
  const { companyData } = useStores();
  const [imageAspect, setImageAspect] = useState(1);
  const textRef = useRef(null);
  const wrapperRef = useRef(null);

  const logoUrl = companyData?.logo
    ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
    : "/logo.png";

  // Keep logo ratio
  useEffect(() => {
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => setImageAspect(img.width / img.height || 1);
  }, [logoUrl]);

  // 🧠 Balanced Smart Scaling
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const textEl = textRef.current;
    if (!wrapper || !textEl) return;

    const maxFontSize = 70;
    const minFontSize = 17;
    let fontSize = maxFontSize;

    const fits = () => {
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = textEl;
      return scrollHeight <= clientHeight && scrollWidth <= clientWidth;
    };

    const resizeToFit = () => {
      while (!fits() && fontSize > minFontSize) {
        fontSize -= 1;
        textEl.style.fontSize = `${fontSize}px`;
      }
      while (fits() && fontSize < maxFontSize) {
        fontSize += 1;
        textEl.style.fontSize = `${fontSize}px`;
        if (!fits()) {
          fontSize -= 1;
          textEl.style.fontSize = `${fontSize}px`;
          break;
        }
      }
    };

    textEl.style.fontSize = `${fontSize}px`;
    textEl.style.lineHeight = "1.1";
    resizeToFit();

    const handleResize = () => resizeToFit();
    window.addEventListener("resize", handleResize);
    window.addEventListener("beforeprint", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeprint", handleResize);
    };
  }, [companyData?.name_am, companyData?.name_en]);

  return (
    <div
      className={`print-header-root w-full flex flex-col items-center justify-center py-1 m-0 px-0 ${className}`}
      style={{ pageBreakInside: "avoid", overflow: "visible" }}
    >
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            overflow: visible !important;
          }

          * {
            overflow: visible !important;
            white-space: normal !important;
            word-break: break-word !important;
          }

          body {
            transform: scale(0.96);
            transform-origin: top left;
          }

          .print-header-logo {
            width: 165px !important;
            height: 180px !important;
          }

          .print-header-text {
            font-weight: 900 !important;
          }

          .print-container {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div
        ref={wrapperRef}
        className="w-full flex items-center justify-center gap-6 mt-1 relative"
        style={{
          height: "150px",
          overflow: "visible",
          alignItems: "center",
        }}
      >
        {/* LOGO — moved to absolute left corner */}
        <div
          className="print-header-logo absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-44 h-40 p-0 rounded-xl border border-gray-300 overflow-hidden"
          style={{
            marginLeft: "0px",
          }}
        >
          <img
            src={logoUrl}
            alt="Company Logo"
            className="object-contain"
            style={{
              aspectRatio: imageAspect,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {/* TEXT */}
        <div
          ref={textRef}
          className="print-header-text flex flex-col justify-center text-center font-black tracking-tight"
          style={{
            height: "100px",
            flex: 1, // ✅ take all space to the right of logo
            marginLeft: "160px", // ✅ spacing after logo (logo width + margin)
            overflow: "hidden",
            lineHeight: "1.1",
            wordBreak: "break-word",
          }}
        >
          <div>{companyData?.name_am || "የኩባንያ ስም"}</div>
          <div className="uppercase mt-1">
            {companyData?.name_en || "COMPANY NAME"}
          </div>
        </div>
      </div>

      {/* CONTACT INFO */}
      <div className="print-header-info flex flex-wrap justify-center gap-x-6 gap-y-1 mt-4 font-bold text-[16px] text-center">
        <div>TIN: {companyData?.tin || "N/A"}</div>
        <div>Phone: {companyData?.phone || "N/A"}</div>
        <div>Address: {companyData?.address || "N/A"}</div>
      </div>

      <hr className="w-4/5 border-gray-500 mt-3 border-t-2" />
    </div>
  );
};

export default PrintHeader;
