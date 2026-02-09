<?php

namespace App\Http\Controllers;

use App\Models\Purchasee;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseeController extends Controller
{
    /**
     * List all purchases
     */
    public function index()
    {
        return response()->json(
            Purchasee::with(['item', 'branch', 'creator', 'receipt'])
                ->latest()
                ->get()
        );
    }

    /**
     * Store a new purchase
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|exists:items,item_code',
            'quantity' => 'required|numeric|min:1',
            'actual_unit_price' => 'required|numeric|min:0',
            'purchase_type' => 'required|string', // with_receipt or without_receipt
            'supplier_name' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',

            // Receipt fields
            'receipt_number' => 'nullable|string|max:100',
            'vat_amount' => 'nullable|numeric|min:0',
            'total_with_vat' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {

            // Calculate total price
            $validated['actual_total_price'] = $validated['quantity'] * $validated['actual_unit_price'];
            $validated['created_by'] = Auth::id();

            $purchase = Purchasee::create($validated);

            // If purchase type is "with_receipt" → create receipt automatically
            if ($validated['purchase_type'] === 'with_receipt') {
                $purchase->receipt()->create([
                    'receipt_number' => $validated['receipt_number'] ?? null,
                    'vat_amount' => $validated['vat_amount'] ?? 0,
                    'total_with_vat' => $validated['total_with_vat'] ?? ($validated['actual_total_price']),
                    'branch_id' => $validated['branch_id'],
                    'created_by' => Auth::id(),
                ]);
            }
        });

        return response()->json([
            'message' => 'Purchase created successfully'
        ], 201);
    }

    /**
     * Show purchase by item_code
     */
    public function show($item_code)
    {
        $purchase = Purchasee::with(['item', 'branch', 'creator', 'receipt'])
            ->where('item_code', $item_code)
            ->firstOrFail();

        return response()->json($purchase);
    }

    /**
     * Update purchase by item_code
     */
    public function update(Request $request, $item_code)
    {
        $purchase = Purchasee::where('item_code', $item_code)->firstOrFail();

        $validated = $request->validate([
            'quantity' => 'sometimes|numeric|min:1',
            'actual_unit_price' => 'sometimes|numeric|min:0',
            'purchase_type' => 'sometimes|string',
            'supplier_name' => 'nullable|string|max:255',
            'branch_id' => 'sometimes|exists:branches,id',

            // Receipt fields
            'receipt_number' => 'nullable|string|max:100',
            'vat_amount' => 'nullable|numeric|min:0',
            'total_with_vat' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($purchase, $validated) {

            // Recalculate total if quantity or unit price changed
            if (isset($validated['quantity']) || isset($validated['actual_unit_price'])) {
                $qty = $validated['quantity'] ?? $purchase->quantity;
                $unit = $validated['actual_unit_price'] ?? $purchase->actual_unit_price;
                $validated['actual_total_price'] = $qty * $unit;
            }

            $purchase->update($validated);

            // Handle receipt
            if (($validated['purchase_type'] ?? $purchase->purchase_type) === 'with_receipt') {
                $purchase->receipt()->updateOrCreate(
                    [], // assuming one-to-one
                    [
                        'receipt_number' => $validated['receipt_number'] ?? $purchase->receipt->receipt_number ?? null,
                        'vat_amount' => $validated['vat_amount'] ?? $purchase->receipt->vat_amount ?? 0,
                        'total_with_vat' => $validated['total_with_vat'] ?? $purchase->actual_total_price,
                        'branch_id' => $validated['branch_id'] ?? $purchase->branch_id,
                        'created_by' => Auth::id(),
                    ]
                );
            } else {
                // If switched to without_receipt → delete existing receipt
                $purchase->receipt()?->delete();
            }
        });

        return response()->json([
            'message' => 'Purchase updated successfully'
        ]);
    }

    /**
     * Delete purchase by item_code
     */
    public function destroy($item_code)
    {
        $purchase = Purchasee::where('item_code', $item_code)->firstOrFail();

        DB::transaction(function () use ($purchase) {
            $purchase->receipt()?->delete();
            $purchase->delete();
        });

        return response()->json([
            'message' => 'Purchase deleted successfully'
        ]);
    }
}
