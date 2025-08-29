<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proforma;

class ProformaController extends Controller
{
public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'jobId' => 'nullable|string',
            'date' => 'required|date',
            'customerName' => 'required|string',
            'customerTin' => 'nullable|string',
            'deliveryDate' => 'nullable|date',
            'preparedBy' => 'nullable|string',
            'status' => 'required|string',
            // 'types_of_jobs' => 'nullabe|string',
            'refNum' => 'nullable|string',
            'validityDate' => 'nullable|string', // ✅ allow letters
            'notes' => 'nullable|string',
            'paymentBefore' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'otherCost' => 'nullable|numeric',

            'labourRows' => 'nullable|array',
            'labourRows.*.description' => 'nullable|string',
            'labourRows.*.unit' => 'nullable|string',
            'labourRows.*.estTime' => 'nullable|numeric',
            'labourRows.*.cost' => 'nullable|numeric',
            'labourRows.*.total' => 'nullable|numeric',

            'spareRows' => 'nullable|array',
            'spareRows.*.description' => 'nullable|string',
            'spareRows.*.unit' => 'nullable|string',
            'spareRows.*.brand' => 'nullable|string',
            'spareRows.*.qty' => 'nullable|numeric',
            'spareRows.*.unitPrice' => 'nullable|numeric',
            'spareRows.*.total' => 'nullable|numeric',

            'labourVat' => 'required|boolean',
            'spareVat' => 'required|boolean',

            'summary' => 'nullable|array',
            'summary.total' => 'nullable|numeric',
            'summary.totalVat' => 'nullable|numeric',
            'summary.grossTotal' => 'nullable|numeric',
            // 'summary.withholding' => 'nullable|numeric',
            'summary.netPay' => 'nullable|numeric',
            'summary.netPayInWords' => 'nullable|string',
        ]);

        $proforma = Proforma::create([
            'job_id' => $validated['jobId'] ?? null,
            'date' => $validated['date'],
            'customer_name' => $validated['customerName'],
            'customer_tin' => $validated['customerTin'] ?? null,
            'status' => $validated['status'],
            // 'types_of_jobs' => $validated['types_of_jobs'],
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
            // 'withholding' => $validated['summary']['withholding'],
            'net_pay' => $validated['summary']['netPay'],
            'net_pay_in_words' => $validated['summary']['netPayInWords'],
        ]);

        if (!empty($validated['labourRows'])) {
            foreach ($validated['labourRows'] as $labour) {
                $proforma->labourItems()->create([
                    'description' => $labour['description'] ?? "",
                    'unit' => $labour['unit'] ?? null,
                    'est_time' => $labour['estTime'] ?? null,
                    'cost' => $labour['cost'] ?? null,
                    'total' => $labour['total'] ?? null,
                ]);
            }
        }

        if (!empty($validated['spareRows'])) {
            foreach ($validated['spareRows'] as $spare) {
                $proforma->spareItems()->create([
                    'description' => $spare['description'] ?? "",
                    'unit' => $spare['unit'] ?? null,
                    'brand' => $spare['brand'] ?? null,
                    'qty' => $spare['qty'] ?? null,
                    'unit_price' => $spare['unitPrice'] ?? null,
                    'total' => $spare['total'] ?? null,
                ]);
            }
        }

        return response()->json([
            'message' => 'Proforma created successfully',
            'id' => $proforma->id,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
}


    // ✅ List all proformas grouped by job_id
    public function index()
    {
        $proformas = Proforma::with(['labourItems', 'spareItems'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($proformas);
    }

    // ✅ Show proforma by job_id
    public function show($jobId)
    {
        $proforma = Proforma::with(['labourItems', 'spareItems'])
            ->where('job_id', $jobId)
            ->first();

        if (!$proforma) {
            return response()->json(['message' => 'Proforma not found'], 404);
        }

        return response()->json($proforma);
    }

    // ✅ Update proforma by job_id
    public function update(Request $request, $jobId)
    {
        $proforma = Proforma::where('job_id', $jobId)->first();

        if (!$proforma) {
            return response()->json(['message' => 'Proforma not found'], 404);
        }

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'customerName' => 'sometimes|string',
            'customerTin' => 'nullable|string',
            'deliveryDate' => 'nullable|date',
            'preparedBy' => 'nullable|string',
            'status' => 'sometimes|string',
            // 'types_of_jobs' => 'sometimes|string',
            'refNum' => 'nullable|string',
            'validityDate' => 'nullable|string',
            'notes' => 'nullable|string',
            'paymentBefore' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'otherCost' => 'nullable|numeric',

            'labourRows' => 'nullable|array',
            'labourRows.*.description' => 'nullable|string',
            'labourRows.*.unit' => 'nullable|string',
            'labourRows.*.estTime' => 'nullable|numeric',
            'labourRows.*.cost' => 'nullable|numeric',
            'labourRows.*.total' => 'nullable|numeric',

            'spareRows' => 'nullable|array',
            'spareRows.*.description' => 'nullable|string',
            'spareRows.*.unit' => 'nullable|string',
            'spareRows.*.brand' => 'nullable|string',
            'spareRows.*.qty' => 'nullable|numeric',
            'spareRows.*.unitPrice' => 'nullable|numeric',
            'spareRows.*.total' => 'nullable|numeric',

            'labourVat' => 'nullable|boolean',
            'spareVat' => 'nullable|boolean',

            'summary' => 'nullable|array',
            'summary.total' => 'nullable|numeric',
            'summary.totalVat' => 'nullable|numeric',
            'summary.grossTotal' => 'nullable|numeric',
            // 'summary.withholding' => 'nullable|numeric',
            'summary.netPay' => 'nullable|numeric',
            'summary.netPayInWords' => 'nullable|string',
        ]);

        // update main proforma
        $proforma->update([
            'date' => $validated['date'] ?? $proforma->date,
            'customer_name' => $validated['customerName'] ?? $proforma->customer_name,
            'customer_tin' => $validated['customerTin'] ?? $proforma->customer_tin,
            'status' => $validated['status'] ?? $proforma->status,
            // 'types_of_jobs' => $validated['types_of_jobs'] ?? $proforma->types_of_jobs,
            'prepared_by' => $validated['preparedBy'] ?? $proforma->prepared_by,
            'delivery_date' => $validated['deliveryDate'] ?? $proforma->delivery_date,
            'ref_num' => $validated['refNum'] ?? $proforma->ref_num,
            'validity_date' => $validated['validityDate'] ?? $proforma->validity_date,
            'notes' => $validated['notes'] ?? $proforma->notes,
            'payment_before' => $validated['paymentBefore'] ?? $proforma->payment_before,
            'discount' => $validated['discount'] ?? $proforma->discount,
            'other_cost' => $validated['otherCost'] ?? $proforma->other_cost,
            'labour_vat' => $validated['labourVat'] ?? $proforma->labour_vat,
            'spare_vat' => $validated['spareVat'] ?? $proforma->spare_vat,
            'total' => $validated['summary']['total'] ?? $proforma->total,
            'total_vat' => $validated['summary']['totalVat'] ?? $proforma->total_vat,
            'gross_total' => $validated['summary']['grossTotal'] ?? $proforma->gross_total,
            // 'withholding' => $validated['summary']['withholding'] ?? $proforma->withholding,
            'net_pay' => $validated['summary']['netPay'] ?? $proforma->net_pay,
            'net_pay_in_words' => $validated['summary']['netPayInWords'] ?? $proforma->net_pay_in_words,
        ]);

        // refresh labour items if provided
        if (isset($validated['labourRows'])) {
            $proforma->labourItems()->delete();
            foreach ($validated['labourRows'] as $labour) {
                $proforma->labourItems()->create([
                    'description' => $labour['description'] ?? null,
                    'unit' => $labour['unit'] ?? null,
                    'est_time' => $labour['estTime'] ?? null,
                    'cost' => $labour['cost'] ?? null,
                    'total' => $labour['total'] ?? null,
                ]);
            }
        }

        // refresh spare items if provided
        if (isset($validated['spareRows'])) {
            $proforma->spareItems()->delete();
            foreach ($validated['spareRows'] as $spare) {
                $proforma->spareItems()->create([
                    'description' => $spare['description'] ?? null,
                    'unit' => $spare['unit'] ?? null,
                    'brand' => $spare['brand'] ?? null,
                    'qty' => $spare['qty'] ?? null,
                    'unit_price' => $spare['unitPrice'] ?? null,
                    'total' => $spare['total'] ?? null,
                ]);
            }
        }

        return response()->json(['message' => 'Proforma updated successfully']);
    }

    // ✅ Delete proforma by job_id
    public function destroy($jobId)
    {
        $proforma = Proforma::where('job_id', $jobId)->first();

        if (!$proforma) {
            return response()->json(['message' => 'Proforma not found'], 404);
        }

        // Delete children first (cascade manually if not set in DB)
        $proforma->labourItems()->delete();
        $proforma->spareItems()->delete();
        $proforma->delete();

        return response()->json(['message' => 'Proforma deleted successfully']);
    }


}
