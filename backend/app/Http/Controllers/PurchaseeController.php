<?php

namespace App\Http\Controllers;

use App\Models\Purchasee;
use App\Models\Receipt;
use App\Models\Item;
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
        'purchase_type' => 'required|in:with_receipt,without_receipt',
        'supplier_name' => 'nullable|string|max:255',
        'branch_id' => 'required|exists:branches,id',
        // optional receipt override
        'receipt_unit_price' => 'nullable|numeric|min:0',
    ]);

    DB::transaction(function () use ($validated) {

        // 1️⃣ Calculate internal totals
        $actualTotal = $validated['quantity'] * $validated['actual_unit_price'];

        $purchase = Purchasee::create([
            'item_code' => $validated['item_code'],
            'quantity' => $validated['quantity'],
            'actual_unit_price' => $validated['actual_unit_price'],
            'actual_total_price' => $actualTotal,
            'purchase_type' => $validated['purchase_type'],
            'supplier_name' => $validated['supplier_name'] ?? null,
            'branch_id' => $validated['branch_id'],
            'created_by' => auth()->id() ?? 1,
        ]);

        // 2️⃣ Update stock
        $item = Item::where('item_code', $validated['item_code'])->first();
        $item->increment('initial_stock', $validated['quantity']);

        // 3️⃣ Receipt logic (ONLY source of VAT)
        if ($purchase->purchase_type === 'with_receipt') {

            $receiptUnitPrice = $validated['receipt_unit_price']
                ?? $purchase->actual_unit_price;

            $receiptTotalPrice = $receiptUnitPrice * $purchase->quantity;

            // ✅ VAT = 15% of receipt total
            $vatPaid = round($receiptTotalPrice * 0.15, 2);

            $purchase->receipt()->create([
                'receipt_unit_price'  => $receiptUnitPrice,
                'receipt_total_price' => $receiptTotalPrice,
                'vat_paid'            => $vatPaid,
                'receipt_date'        => now(),
                'branch_id'           => $purchase->branch_id,
                'created_by'          => auth()->id() ?? 1,
            ]);
        }
    });

    return response()->json([
        'message' => 'Purchase created successfully'
    ], 201);
}


    /**
     * Show a single purchase by ID
     */
    public function show($id)
    {
        $purchase = Purchasee::with(['item', 'branch', 'creator', 'receipt'])
            ->findOrFail($id);

        return response()->json($purchase);
    }

    /**
     * Update a purchase by ID
     */
    public function update(Request $request, $id)
    {
        $purchase = Purchasee::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'sometimes|numeric|min:1',
            'actual_unit_price' => 'sometimes|numeric|min:0',
            'purchase_type' => 'sometimes|string|in:with_receipt,without_receipt',
            'supplier_name' => 'nullable|string|max:255',
            'branch_id' => 'sometimes|exists:branches,id',
            // Receipt fields
            'receipt_number' => 'nullable|string|max:100',
            'vat_amount' => 'nullable|numeric|min:0',
            'total_with_vat' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($purchase, $validated) {
            $item = $purchase->item;

            // If quantity changes, update item stock accordingly
            if (isset($validated['quantity'])) {
                $stockDifference = $validated['quantity'] - $purchase->quantity;
                if ($item) {
                    $item->initial_stock += $stockDifference;
                    $item->save();
                }
            }

            // Recalculate total price if quantity or unit price changes
            if (isset($validated['quantity']) || isset($validated['actual_unit_price'])) {
                $qty = $validated['quantity'] ?? $purchase->quantity;
                $unit = $validated['actual_unit_price'] ?? $purchase->actual_unit_price;
                $validated['actual_total_price'] = $qty * $unit;
            }

            // Update purchase
            $purchase->update($validated);

            // Handle receipt
            if (($validated['purchase_type'] ?? $purchase->purchase_type) === 'with_receipt') {
                $unitPrice = $validated['actual_unit_price'] ?? $purchase->actual_unit_price;
                $qty = $validated['quantity'] ?? $purchase->quantity;

                $purchase->receipt()->updateOrCreate(
                    ['purchasee_id' => $purchase->id],
                    [
                        'receipt_number' => $validated['receipt_number'] ?? $purchase->receipt->receipt_number ?? null,
                        'receipt_unit_price' => $unitPrice,
                        'receipt_total_price' => $unitPrice * $qty,
                        'receipt_date' => now(),
                        'vat_amount' => $validated['vat_amount'] ?? $purchase->receipt->vat_amount ?? 0,
                        'branch_id' => $validated['branch_id'] ?? $purchase->branch_id,
                        'created_by' => Auth::id() ?? null,
                    ]
                );
            } else {
                // Delete receipt if switched to without_receipt
                $purchase->receipt()?->delete();
            }
        });

        return response()->json([
            'message' => 'Purchase updated successfully'
        ]);
    }

    /**
     * Delete a purchase by ID
     */
    public function destroy($id)
    {
        $purchase = Purchasee::findOrFail($id);

        DB::transaction(function () use ($purchase) {
            // Update item stock
            $item = $purchase->item;
            if ($item) {
                $item->initial_stock -= $purchase->quantity;
                if ($item->initial_stock < 0) $item->initial_stock = 0;
                $item->save();
            }

            // Delete receipt & purchase
            $purchase->receipt()?->delete();
            $purchase->delete();
        });

        return response()->json([
            'message' => 'Purchase deleted successfully'
        ]);
    }
}
