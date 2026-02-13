<?php

namespace App\Http\Controllers;

use App\Models\Item;

class ReportsController extends Controller
{
    public function itemVatReport()
    {
        $items = Item::with([
            'purchases.receipt',
            'sales.receipt'
        ])->get();

        $report = $items->map(function ($item) {

            /* =======================
             | PURCHASE TABLE
             ======================= */
            $purchaseRows = $item->purchases->map(function ($p) {
                return [
                    'with_receipt' => $p->purchase_type === 'with_receipt' && $p->receipt ? 'Yes' : 'No',
                    'quantity' => $p->quantity,
                    'total_purchase_price' =>
                        $p->receipt
                            ? (float) $p->receipt->receipt_total_price
                            : (float) $p->actual_total_price,
                    'vat' =>
                        $p->receipt
                            ? (float) $p->receipt->vat_paid
                            : 0,
                ];
            });

            $purchaseTotals = [
                'with_receipt' => 'TOTAL',
                'quantity' => $purchaseRows->sum('quantity'),
                'total_purchase_price' => $purchaseRows->sum('total_purchase_price'),
                'vat' => $purchaseRows->sum('vat'),
            ];

            /* =======================
             | SALES TABLE
             ======================= */
            $saleRows = $item->sales->map(function ($s) {
                return [
                    'with_receipt' => $s->sale_type === 'with_receipt' && $s->receipt ? 'Yes' : 'No',
                    'quantity' => $s->quantity,
                    'total_sell_price' =>
                        $s->receipt
                            ? (float) $s->receipt->receipt_total_price
                            : (float) $s->actual_total_price,
                    'vat' =>
                        $s->receipt
                            ? (float) $s->receipt->vat_collected
                            : 0,
                ];
            });

            $saleTotals = [
                'with_receipt' => 'TOTAL',
                'quantity' => $saleRows->sum('quantity'),
                'total_sell_price' => $saleRows->sum('total_sell_price'),
                'vat' => $saleRows->sum('vat'),
            ];

            /* =======================
             | STATUS + RECOMMENDATION
             ======================= */
   /* =======================
 | STATUS + RECOMMENDATION
 ======================= */

$purchaseVat = $purchaseTotals['vat'];
$saleVat = $saleTotals['vat'];

$purchaseWithReceiptQty = $purchaseRows
    ->where('with_receipt', 'Yes')
    ->sum('quantity');

$saleWithReceiptQty = $saleRows
    ->where('with_receipt', 'Yes')
    ->sum('quantity');

$vatBalance = $saleVat - $purchaseVat;


/* =======================
 | DECISION LOGIC
 ======================= */

if ($saleWithReceiptQty > $purchaseWithReceiptQty) {

    $status = 'IMBALANCED';

    $recommendation = 
        'You are selling more items with VAT receipts than you are purchasing with VAT receipts. 
        This increases your VAT payable amount and audit exposure. 
        Consider purchasing more items with VAT receipts to balance input and output VAT.';

} elseif ($purchaseWithReceiptQty > $saleWithReceiptQty) {

    $status = 'VAT CREDIT';

    $recommendation = 
        'You are purchasing more items with VAT receipts than you are selling with VAT receipts. 
        You may accumulate VAT credit. Ensure proper documentation for future VAT claims.';

} elseif ($purchaseVat > 0 && $saleVat > 0) {

    $status = 'BALANCED';

    $recommendation = 
        'VAT activity is balanced between purchases and sales. Maintain consistent VAT compliance.';

} elseif ($purchaseVat == 0 && $saleVat > 0) {

    $status = 'HIGH RISK';

    $recommendation = 
        'Sales VAT is being collected without corresponding purchase VAT. 
        This may indicate supplier non-compliance or increased tax liability.';

} elseif ($purchaseVat == 0 && $saleVat == 0) {

    $status = 'LOW ACTIVITY';

    $recommendation = 
        'No VAT activity detected. Monitor transactions if VAT registration is required.';

} else {

    $status = 'REVIEW';

    $recommendation = 
        'Mixed VAT behavior detected. Manual financial review is recommended.';
}


            return [
                'item_code' => $item->item_code,
                'item_name' => $item->item_name,

                'purchase_table' => [
                    'rows' => $purchaseRows,
                    'total' => $purchaseTotals,
                ],

                'sales_table' => [
                    'rows' => $saleRows,
                    'total' => $saleTotals,
                ],

                'status' => $status,
                'recommendation' => $recommendation,
            ];
        });

        return response()->json($report);
    }
}
