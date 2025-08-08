import React from "react";

// Utility: Number to words (basic for demo; can be replaced with a proper library)
import { toWords } from "number-to-words";

const numberToWords = (num) => {
  const [whole, decimal] = num.toFixed(2).split(".");
  let words = toWords(Number(whole));
  if (Number(decimal) > 0) {
    words += ` and ${toWords(Number(decimal))} Cents`;
  }
  return words.charAt(0).toUpperCase() + words.slice(1) + " Birr";
};
function ProformaTotals({ formData }) {
  const subtotal = formData.items.reduce(
    (acc, item) => acc + item.totalCost,
    0
  );
  const vat = subtotal * 0.15;
  const grossTotal = subtotal + vat;
  const withholding = grossTotal * 0.02;
  const netPay = grossTotal - withholding;

  return (
    <div className="w-full max-w-md ml-auto mt-8 rounded-2xl border shadow-lg p-6 bg-white dark:bg-gray-900 transition-all">
      <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">
        Proforma Summary
      </h3>

      <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
        <div className="flex justify-between hover:text-blue-600 transition">
          <span>Sub Total</span>
          <span>{subtotal.toFixed(2)} Birr</span>
        </div>

        <div className="flex justify-between hover:text-blue-600 transition">
          <span>VAT (15%)</span>
          <span>{vat.toFixed(2)} Birr</span>
        </div>

        <div className="flex justify-between hover:text-blue-600 transition">
          <span>Gross Total</span>
          <span>{grossTotal.toFixed(2)} Birr</span>
        </div>

        <div className="flex justify-between hover:text-blue-600 transition">
          <span>Withholding (2%)</span>
          <span>{withholding.toFixed(2)} Birr</span>
        </div>

        <div className="flex justify-between font-bold text-green-600 text-base pt-3 border-t border-gray-300 dark:border-gray-700">
          <span>Net Pay</span>
          <span>{netPay.toFixed(2)} Birr</span>
        </div>
      </div>

      <div className="mt-4 text-sm italic text-gray-500 dark:text-gray-400">
        <span className="font-semibold">In Words:</span> {numberToWords(netPay)}
      </div>
    </div>
  );
}

export default ProformaTotals;
