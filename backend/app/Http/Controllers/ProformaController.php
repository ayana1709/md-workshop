<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proforma;

class ProformaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jobId' => 'nullable|string',
            'date' => 'required|date',
            'customerName' => 'required|string',
            'customerTin' => 'nullable|string',
            'deliveryDate' => 'nullable|date',
            'preparedBy' => 'nullable|string',
            'product_name' => 'required|string',
            'types_of_jobs' => 'required|string',
            'refNum' => 'nullable|string',
            'validityDate' => 'nullable|date',
            'notes' => 'nullable|string',
            'paymentBefore' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'otherCost' => 'nullable|numeric',

            'labourRows' => 'required|array',
            'labourRows.*.description' => 'required|string',
            'labourRows.*.unit' => 'nullable|string',
            'labourRows.*.estTime' => 'nullable|numeric',
            'labourRows.*.cost' => 'nullable|numeric',
            'labourRows.*.total' => 'nullable|numeric',

            'spareRows' => 'required|array',
            'spareRows.*.description' => 'required|string',
            'spareRows.*.unit' => 'nullable|string',
            'spareRows.*.brand' => 'nullable|string',
            'spareRows.*.qty' => 'nullable|numeric',
            'spareRows.*.unitPrice' => 'nullable|numeric',
            'spareRows.*.total' => 'nullable|numeric',

            'labourVat' => 'required|boolean',
            'spareVat' => 'required|boolean',

            'summary' => 'required|array',
            'summary.total' => 'required|numeric',
            'summary.totalVat' => 'required|numeric',
            'summary.grossTotal' => 'required|numeric',
            'summary.withholding' => 'required|numeric',
            'summary.netPay' => 'required|numeric',
            'summary.netPayInWords' => 'required|string',
        ]);

        // Create the main Proforma
        $proforma = Proforma::create([
            'job_id' => $validated['jobId'],
            'date' => $validated['date'],
            'customer_name' => $validated['customerName'],
            'customer_tin' => $validated['customerTin'] ?? null,
            'product_name' => $validated['product_name'],
            'types_of_jobs' => $validated['types_of_jobs'],
            'prepared_by' => $validated['preparedBy'] ?? null,
            'delivery_date' => $validated['deliveryDate'] ?? null,
            'ref_num' => $validated['refNum'] ?? null,
            'validity_date' => $validated['validityDate'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'payment_before' => $validated['paymentBefore'] ?? 0,
            'discount' => $validated['discount'] ?? 0,
            'other_cost' => $validated['otherCost'] ?? 0,
            'labour_vat' => $validated['labourVat'],
            'spare_vat' => $validated['spareVat'],
            'total' => $validated['summary']['total'],
            'total_vat' => $validated['summary']['totalVat'],
            'gross_total' => $validated['summary']['grossTotal'],
            'withholding' => $validated['summary']['withholding'],
            'net_pay' => $validated['summary']['netPay'],
            'net_pay_in_words' => $validated['summary']['netPayInWords'],
        ]);

        // Save labour rows
        foreach ($validated['labourRows'] as $labour) {
            $proforma->labourItems()->create([
                'description' => $labour['description'],
                'unit' => $labour['unit'] ?? null,
                'est_time' => $labour['estTime'] ?? null,
                'cost' => $labour['cost'] ?? null,
                'total' => $labour['total'] ?? null,
            ]);
        }

        // Save spare rows
        foreach ($validated['spareRows'] as $spare) {
            $proforma->spareItems()->create([
                'description' => $spare['description'],
                'unit' => $spare['unit'] ?? null,
                'brand' => $spare['brand'] ?? null,
                'qty' => $spare['qty'] ?? null,
                'unit_price' => $spare['unitPrice'] ?? null,
                'total' => $spare['total'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Proforma created successfully',
            'id' => $proforma->id,
        ]);
    }
}
