<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proforma;
use Illuminate\Support\Facades\DB;

class ProformaController extends Controller
{
    // ✅ Create new proforma
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'refNum' => 'required|string|unique:proformas,ref_num',
                'date' => 'required|date',
                'customerName' => 'required|string',
                'customerTin' => 'nullable|string',
                'deliveryDate' => 'nullable|date',
                'preparedBy' => 'nullable|string',
                'status' => 'required|string',
                'validityDate' => 'nullable|string',
                'notes' => 'nullable|string',
                'paymenttype'=>'nullable|string',
                'paymentBefore' => 'nullable|numeric',
                'discount' => 'nullable|numeric',
                'otherCost' => 'nullable|numeric',


                'labourRows' => 'nullable|array',
                'labourRows.*.description' => 'nullable|string',
                'labourRows.*.unit' => 'nullable|string',
                'labourRows.*.estTime' => 'nullable|numeric',
                'labourRows.*.cost' => 'nullable|numeric',
                'labourRows.*.total' => 'nullable|numeric',
                'labourRows.*.remark' => 'nullable|string',

                'spareRows' => 'nullable|array',
                'spareRows.*.description' => 'nullable|string',
                'spareRows.*.unit' => 'nullable|string',
                'spareRows.*.brand' => 'nullable|string',
                'spareRows.*.qty' => 'nullable|numeric',
                'spareRows.*.unit_price' => 'nullable|numeric',
                'spareRows.*.total' => 'nullable|numeric',
                'spareRows.*.remark' => 'nullable|string',

                'labourVat' => 'required|boolean',
                'spareVat' => 'required|boolean',

                'summary' => 'nullable|array',
                'summary.total' => 'nullable|numeric',
                'summary.totalVat' => 'nullable|numeric',
                'summary.grossTotal' => 'nullable|numeric',
                'summary.netPay' => 'nullable|numeric',
                'summary.netPayInWords' => 'nullable|string',
            ]);

            $proforma = Proforma::create([
                'ref_num' => $validated['refNum'],
                'date' => $validated['date'],
                'customer_name' => $validated['customerName'],
                'customer_tin' => $validated['customerTin'] ?? null,
                'status' => $validated['status'],
                'prepared_by' => $validated['preparedBy'] ?? null,
                'delivery_date' => $validated['deliveryDate'] ?? null,
                'validity_date' => $validated['validityDate'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'paymenttype'=>$validated['paymenttype'] ?? null,
                'payment_before' => $validated['paymentBefore'] ?? 0,
                'discount' => $validated['discount'] ?? 0,
                'other_cost' => $validated['otherCost'] ?? 0,
                'labour_vat' => $validated['labourVat'],
                'spare_vat' => $validated['spareVat'],
                'total' => $validated['summary']['total'] ?? 0,
                'total_vat' => $validated['summary']['totalVat'] ?? 0,
                'gross_total' => $validated['summary']['grossTotal'] ?? 0,
                'net_pay' => $validated['summary']['netPay'] ?? 0,
                'net_pay_in_words' => $validated['summary']['netPayInWords'] ?? "",
            ]);

            // ✅ Labour Items
            if (!empty($validated['labourRows'])) {
                foreach ($validated['labourRows'] as $labour) {
                    $proforma->labourItems()->create([
                        'description' => $labour['description'] ?? '',
                        'unit' => $labour['unit'] ?? '',
                        'est_time' => $labour['estTime'] ?? 0,
                        'cost' => $labour['cost'] ?? 0,
                        'total' => $labour['total'] ?? 0,
                        'remark' => $labour['remark'] ?? '',
                    ]);
                }
            }

            // ✅ Spare Items
            if (!empty($validated['spareRows'])) {
                foreach ($validated['spareRows'] as $spare) {
                    $proforma->spareItems()->create([
                        'description' => $spare['description'] ?? '',
                        'unit' => $spare['unit'] ?? '',
                        'brand' => $spare['brand'] ?? '',
                        'qty' => $spare['qty'] ?? 0,
                        'unit_price' => $spare['unit_price'] ?? 0,
                        'total' => $spare['total'] ?? 0,
                        'remark' => $spare['remark'] ?? '',
                    ]);
                }
            }

            return response()->json([
                'message' => 'Proforma created successfully',
                'ref_num' => $proforma->ref_num,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    // ✅ Get all proformas
    public function index()
    {
        $proformas = Proforma::with(['labourItems', 'spareItems'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($proformas);
    }


public function generateRefNum()
{
    // Get the last proforma by ID
    $lastProforma = \App\Models\Proforma::orderBy('id', 'desc')->first();

    if (!$lastProforma || !$lastProforma->ref_num) {
        $nextRef = 'REF-0001';
    } else {
        // Extract numeric part (supports formats like REF-0001, REF---0001, etc.)
        preg_match('/(\d+)$/', $lastProforma->ref_num, $matches);
        $lastNumber = isset($matches[1]) ? intval($matches[1]) : 0;

        // Increment and format next ref number
        $nextNumber = $lastNumber + 1;
        $nextRef = 'REF-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    return response()->json(['refNum' => $nextRef]);
}







    // ✅ Show single proforma
    public function show($refNum)
    {
        $proforma = Proforma::with(['labourItems', 'spareItems'])
            ->where('ref_num', $refNum)
            ->first();

        if (!$proforma) {
            return response()->json(['message' => 'Proforma not found'], 404);
        }

        return response()->json($proforma);
    }

    // ✅ Update proforma
 

    public function update(Request $request, $refNum)
{
    $proforma = Proforma::where('ref_num', $refNum)->first();

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
        'validityDate' => 'nullable|string',
        'notes' => 'nullable|string',
        'paymenttype'=>'nullable|string',
        'paymentBefore' => 'nullable|numeric',
        'discount' => 'nullable|numeric',
        'otherCost' => 'nullable|numeric',

        'labourRows' => 'nullable|array',
        'labourRows.*.description' => 'nullable|string',
        'labourRows.*.unit' => 'nullable|string',
        'labourRows.*.estTime' => 'nullable|numeric',
        'labourRows.*.cost' => 'nullable|numeric',
        'labourRows.*.total' => 'nullable|numeric',
        'labourRows.*.remark' => 'nullable|string',

        'spareRows' => 'nullable|array',
        'spareRows.*.description' => 'nullable|string',
        'spareRows.*.unit' => 'nullable|string',
        'spareRows.*.brand' => 'nullable|string',
        'spareRows.*.qty' => 'nullable|numeric',
        'spareRows.*.unit_price' => 'nullable|numeric',
        'spareRows.*.total' => 'nullable|numeric',
        'spareRows.*.remark' => 'nullable|string',

        'labourVat' => 'nullable|boolean',
        'spareVat' => 'nullable|boolean',

        'summary' => 'nullable|array',
        'summary.total' => 'nullable|numeric',
        'summary.totalVat' => 'nullable|numeric',
        'summary.grossTotal' => 'nullable|numeric',
        'summary.netPay' => 'nullable|numeric',
        'summary.netPayInWords' => 'nullable|string',

        // Accept totals directly as well
        'total' => 'nullable|numeric',
        'totalVat' => 'nullable|numeric',
        'grossTotal' => 'nullable|numeric',
        'netPay' => 'nullable|numeric',
        'netPayInWords' => 'nullable|string',
    ]);

    // ✅ Merge direct and summary totals
    $summary = $validated['summary'] ?? [];
    $total = $summary['total'] ?? $validated['total'] ?? $proforma->total;
    $totalVat = $summary['totalVat'] ?? $validated['totalVat'] ?? $proforma->total_vat;
    $grossTotal = $summary['grossTotal'] ?? $validated['grossTotal'] ?? $proforma->gross_total;
    $netPay = $summary['netPay'] ?? $validated['netPay'] ?? $proforma->net_pay;
    $netPayInWords = $summary['netPayInWords'] ?? $validated['netPayInWords'] ?? $proforma->net_pay_in_words;

    // ✅ Update the main proforma
    $proforma->update([
        'date' => $validated['date'] ?? $proforma->date,
        'customer_name' => $validated['customerName'] ?? $proforma->customer_name,
        'customer_tin' => $validated['customerTin'] ?? $proforma->customer_tin,
        'status' => $validated['status'] ?? $proforma->status,
        'prepared_by' => $validated['preparedBy'] ?? $proforma->prepared_by,
        'delivery_date' => $validated['deliveryDate'] ?? $proforma->delivery_date,
        'validity_date' => $validated['validityDate'] ?? $proforma->validity_date,
        'notes' => $validated['notes'] ?? $proforma->notes,
                'paymenttype'=>$validated['paymenttype'] ?? null,
        'payment_before' => $validated['paymentBefore'] ?? $proforma->payment_before,
        'discount' => $validated['discount'] ?? $proforma->discount,
        'other_cost' => $validated['otherCost'] ?? $proforma->other_cost,
        'labour_vat' => $validated['labourVat'] ?? $proforma->labour_vat,
        'spare_vat' => $validated['spareVat'] ?? $proforma->spare_vat,
        'total' => $total,
        'total_vat' => $totalVat,
        'gross_total' => $grossTotal,
        'net_pay' => $netPay,
        'net_pay_in_words' => $netPayInWords,
    ]);

    // ✅ Update related items
    if (isset($validated['labourRows'])) {
        $proforma->labourItems()->delete();
        foreach ($validated['labourRows'] as $labour) {
            $proforma->labourItems()->create([
                'description' => $labour['description'] ?? '',
                'unit' => $labour['unit'] ?? '',
                'est_time' => $labour['estTime'] ?? 0,
                'cost' => $labour['cost'] ?? 0,
                'total' => $labour['total'] ?? 0,
                'remark' => $labour['remark'] ?? '',
            ]);
        }
    }

    if (isset($validated['spareRows'])) {
        $proforma->spareItems()->delete();
        foreach ($validated['spareRows'] as $spare) {
            $proforma->spareItems()->create([
                'description' => $spare['description'] ?? '',
                'unit' => $spare['unit'] ?? '',
                'brand' => $spare['brand'] ?? '',
                'qty' => $spare['qty'] ?? 0,
                'unit_price' => $spare['unit_price'] ?? 0,
                'total' => $spare['total'] ?? 0,
                'remark' => $spare['remark'] ?? '',
            ]);
        }
    }

    return response()->json([
        'message' => 'Proforma updated successfully',
        'proforma' => $proforma->fresh(['labourItems', 'spareItems']),
    ]);
}


    // ✅ Delete proforma
    public function destroy($refNum)
    {
        $proforma = Proforma::where('ref_num', $refNum)->first();

        if (!$proforma) {
            return response()->json(['message' => 'Proforma not found'], 404);
        }

        $proforma->labourItems()->delete();
        $proforma->spareItems()->delete();
        $proforma->delete();

        return response()->json(['message' => 'Proforma deleted successfully']);
    }
}
