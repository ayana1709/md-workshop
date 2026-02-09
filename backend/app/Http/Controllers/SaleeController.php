<?php

namespace App\Http\Controllers;

use App\Models\Salee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleeController extends Controller
{
    /**
     * List all sales (optional filters later)
     */
    public function index()
    {
        $sales = Salee::with(['item', 'branch', 'receipt'])->get();
        return response()->json($sales);
    }

    /**
     * Store a new sale
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code'           => 'required|exists:items,item_code',
            'quantity'            => 'required|integer|min:1',

            'actual_unit_price'   => 'required|numeric|min:0',
            'actual_total_price'  => 'required|numeric|min:0',

            'sale_type'           => 'nullable|in:with_receipt,without_receipt',
            'branch_id'           => 'required|exists:branches,id',
        ]);

        $sale = Salee::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Sale created successfully',
            'data'    => $sale,
        ], 201);
    }

    /**
     * Show sale(s) by item_code
     * IMPORTANT: returns ALL sales for that item
     */
    public function show(string $item_code)
    {
        $sales = Salee::with(['item', 'branch', 'receipt'])
            ->where('item_code', $item_code)
            ->get();

        if ($sales->isEmpty()) {
            return response()->json([
                'message' => 'No sales found for this item',
            ], 404);
        }

        return response()->json($sales);
    }

    /**
     * Update sale(s) by item_code
     */
    public function update(Request $request, string $item_code)
    {
        $validated = $request->validate([
            'quantity'            => 'nullable|integer|min:1',

            'actual_unit_price'   => 'nullable|numeric|min:0',
            'actual_total_price'  => 'nullable|numeric|min:0',

            'sale_type'           => 'nullable|in:with_receipt,without_receipt',
        ]);

        $updated = Salee::where('item_code', $item_code)->update($validated);

        if ($updated === 0) {
            return response()->json([
                'message' => 'No sale records found to update',
            ], 404);
        }

        return response()->json([
            'message' => 'Sale updated successfully',
        ]);
    }

    /**
     * Delete sale(s) by item_code
     */
    public function destroy(string $item_code)
    {
        $deleted = Salee::where('item_code', $item_code)->delete();

        if ($deleted === 0) {
            return response()->json([
                'message' => 'No sale records found to delete',
            ], 404);
        }

        return response()->json([
            'message' => 'Sale deleted successfully',
        ]);
    }
}
