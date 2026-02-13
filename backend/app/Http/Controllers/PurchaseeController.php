<?php

namespace App\Http\Controllers;

use App\Models\Purchasee;
use App\Models\PurchaseReceipt;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
     * Store new purchase
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
            'receipt_unit_price' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {

            $actualTotal = $validated['quantity'] * $validated['actual_unit_price'];

            $purchase = Purchasee::create([
                'item_code' => $validated['item_code'],
                'quantity' => $validated['quantity'],
                'actual_unit_price' => $validated['actual_unit_price'],
                'actual_total_price' => $actualTotal,
                'purchase_type' => $validated['purchase_type'],
                'supplier_name' => $validated['supplier_name'] ?? null,
                'branch_id' => $validated['branch_id'],
                'created_by' => Auth::id() ?? 1,
            ]);

            // Update stock
            $item = Item::where('item_code', $validated['item_code'])->first();
            $item->increment('initial_stock', $validated['quantity']);

            // Receipt
            if ($purchase->purchase_type === 'with_receipt') {

                $receiptUnit = $validated['receipt_unit_price']
                    ?? $purchase->actual_unit_price;

                $receiptTotal = $receiptUnit * $purchase->quantity;

                $vatPaid = round($receiptTotal * 0.15, 2);

                $purchase->receipt()->create([
                    'receipt_unit_price' => $receiptUnit,
                    'receipt_total_price' => $receiptTotal,
                    'vat_paid' => $vatPaid,
                    'receipt_date' => now(),
                    'branch_id' => $purchase->branch_id,
                    'created_by' => Auth::id() ?? 1,
                ]);
            }
        });

        return response()->json([
            'message' => 'Purchase created successfully'
        ], 201);
    }

    /**
     * Show single purchase
     */
    public function show($id)
    {
        return response()->json(
            Purchasee::with(['item', 'branch', 'creator', 'receipt'])
                ->findOrFail($id)
        );
    }

    /**
     * Update purchase
     */
    public function update(Request $request, $id)
    {
        $purchase = Purchasee::with('receipt')->findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'sometimes|numeric|min:1',
            'actual_unit_price' => 'sometimes|numeric|min:0',
            'purchase_type' => 'sometimes|in:with_receipt,without_receipt',
            'supplier_name' => 'nullable|string|max:255',
            'branch_id' => 'sometimes|exists:branches,id',
            'receipt_unit_price' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($purchase, $validated) {

            $item = $purchase->item;

            // Adjust stock if quantity changes
            if (isset($validated['quantity'])) {
                $difference = $validated['quantity'] - $purchase->quantity;
                $item->increment('initial_stock', $difference);
            }

            // Recalculate total if needed
            $qty = $validated['quantity'] ?? $purchase->quantity;
            $unit = $validated['actual_unit_price'] ?? $purchase->actual_unit_price;

            $validated['actual_total_price'] = $qty * $unit;

            $purchase->update($validated);

            $type = $validated['purchase_type'] ?? $purchase->purchase_type;

            if ($type === 'with_receipt') {

                $receiptUnit = $validated['receipt_unit_price'] ?? $unit;
                $receiptTotal = $receiptUnit * $qty;
                $vatPaid = round($receiptTotal * 0.15, 2);

                $purchase->receipt()->updateOrCreate(
                    ['purchasee_id' => $purchase->id],
                    [
                        'receipt_unit_price' => $receiptUnit,
                        'receipt_total_price' => $receiptTotal,
                        'vat_paid' => $vatPaid,
                        'receipt_date' => now(),
                        'branch_id' => $validated['branch_id'] ?? $purchase->branch_id,
                        'created_by' => Auth::id() ?? 1,
                    ]
                );
            } else {
                $purchase->receipt()?->delete();
            }
        });

        return response()->json([
            'message' => 'Purchase updated successfully'
        ]);
    }

    /**
     * Delete purchase
     */
    public function destroy($id)
    {
        $purchase = Purchasee::findOrFail($id);

        DB::transaction(function () use ($purchase) {

            $item = $purchase->item;

            if ($item) {
                $item->decrement('initial_stock', $purchase->quantity);
            }

            $purchase->receipt()?->delete();
            $purchase->delete();
        });

        return response()->json([
            'message' => 'Purchase deleted successfully'
        ]);
    }
    /**
 * Get purchases WITH receipt only
 */
public function withReceipt()
{
    return response()->json(
        Purchasee::with(['receipt'])
            ->where('purchase_type', 'with_receipt')
            ->latest()
            ->get()
    );
}


}
