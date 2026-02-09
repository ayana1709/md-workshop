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
            $purchaseVat = $purchaseTotals['vat'];
            $saleVat = $saleTotals['vat'];

            if ($purchaseVat > 0 && $saleVat > 0) {
                $status = 'NORMAL';
                $recommendation = 'VAT compliant. No action required.';
            } elseif ($purchaseVat == 0 && $saleVat > 0) {
                $status = 'RISKY';
                $recommendation = 'Sales VAT collected without purchase VAT. Investigate supplier compliance.';
            } elseif ($purchaseVat == 0 && $saleVat == 0) {
                $status = 'LOW RISK';
                $recommendation = 'No VAT activity. Monitor future transactions.';
            } else {
                $status = 'REVIEW';
                $recommendation = 'Mixed VAT behavior. Manual audit recommended.';
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
