function ProformaTotals({ formData }) {
  const subtotal = formData.items.reduce(
    (acc, item) => acc + item.totalCost,
    0
  );

  const vat = subtotal * 0.15;
  const grossTotal = subtotal + vat;
  const withholding = grossTotal * 0.02;
  const netPay = grossTotal - withholding;

  // Utility: number to words (can replace this with a library if needed)
  const numberToWords = (num) => {
    return num.toFixed(2) + " Birr"; // Placeholder
  };

  return (
    <div className="max-w-md ml-auto mt-6 text-sm border rounded-lg p-4 shadow">
      <div className="flex justify-between mb-2">
        <span className="font-medium">Sub Total:</span>
        <span>{subtotal.toFixed(2)} Birr</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">VAT (15%):</span>
        <span>{vat.toFixed(2)} Birr</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">Gross Total:</span>
        <span>{grossTotal.toFixed(2)} Birr</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">Withholding (2%):</span>
        <span>{withholding.toFixed(2)} Birr</span>
      </div>
      <div className="flex justify-between mb-4 border-t pt-2 font-semibold text-lg">
        <span>Net Pay:</span>
        <span>{netPay.toFixed(2)} Birr</span>
      </div>
      <div className="text-gray-600 italic">
        <span className="font-medium">In Words:</span> {numberToWords(netPay)}
      </div>
    </div>
  );
}

export default ProformaTotals;
