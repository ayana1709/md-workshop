<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReceiptController extends Controller
{
    /**
     * List all receipts (all items or without item)
     */
    public function index()
    {
        // Get all receipts, including those without an item
        $receipts = Receipt::with('item')->orderBy('receipt_date', 'desc')->get();
        return response()->json($receipts);
    }

    /**
     * Show receipts by item code (or single receipt if needed)
     */
    public function show($item_code)
    {
        // If item_code exists in items, fetch receipts for that item
        $item = Item::with('receipts')->find($item_code);

        if ($item) {
            return response()->json($item->receipts);
        }

        // If item_code not found, try to find as receipt id
        $receipt = Receipt::with('item')->find($item_code);

        if ($receipt) {
            return response()->json($receipt);
        }

        return response()->json(['message' => 'Receipt or item not found'], 404);
    }

    /**
     * Store a new receipt (can be with or without item)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'nullable|exists:items,item_code',
            'receipt_unit_price' => 'nullable|numeric|min:0',
            'receipt_total_price' => 'nullable|numeric|min:0',
            'receipt_number' => 'nullable|string|max:255',
            'receipt_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'receipt_date' => 'required|date',
            'branch_id' => 'required|exists:branches,id',
        ]);

        // Handle image upload if exists
        if ($request->hasFile('receipt_image')) {
            $path = $request->file('receipt_image')->store('receipts', 'public');
            $validated['receipt_image'] = $path;
        }

        $validated['created_by'] = Auth::id();

        $receipt = Receipt::create($validated);

        return response()->json([
            'message' => 'Receipt created successfully',
            'receipt' => $receipt->load('item')
        ], 201);
    }

    /**
     * Update a receipt
     */
    public function update(Request $request, $id)
    {
        $receipt = Receipt::findOrFail($id);

        $validated = $request->validate([
            'item_code' => 'nullable|exists:items,item_code',
            'receipt_unit_price' => 'nullable|numeric|min:0',
            'receipt_total_price' => 'nullable|numeric|min:0',
            'receipt_number' => 'nullable|string|max:255',
            'receipt_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'receipt_date' => 'sometimes|date',
            'branch_id' => 'sometimes|exists:branches,id',
        ]);

        if ($request->hasFile('receipt_image')) {
            if ($receipt->receipt_image && Storage::disk('public')->exists($receipt->receipt_image)) {
                Storage::disk('public')->delete($receipt->receipt_image);
            }
            $path = $request->file('receipt_image')->store('receipts', 'public');
            $validated['receipt_image'] = $path;
        }

        $receipt->update($validated);

        return response()->json([
            'message' => 'Receipt updated successfully',
            'receipt' => $receipt->load('item')
        ]);
    }

    /**
     * Delete a receipt
     */
    public function destroy($id)
    {
        $receipt = Receipt::findOrFail($id);

        if ($receipt->receipt_image && Storage::disk('public')->exists($receipt->receipt_image)) {
            Storage::disk('public')->delete($receipt->receipt_image);
        }

        $receipt->delete();

        return response()->json(['message' => 'Receipt deleted successfully']);
    }

    /**
     * Optional: Generate a receipt number automatically
     */
    public function generateReceiptNumber()
    {
        $lastNumber = Receipt::orderBy('id', 'desc')->value('receipt_number');
        $next = $lastNumber ? intval($lastNumber) + 1 : 1;
        return str_pad($next, 6, '0', STR_PAD_LEFT);
    }
}
