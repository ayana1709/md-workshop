<?php

namespace App\Http\Controllers;

use App\Models\PendingRequestedItem;
use App\Models\SpareRequest;
use Illuminate\Http\Request;
use App\Models\RequestItemOut;


class PendingRequestedItemController extends Controller {
    public function store(Request $request)
{
    $validated = $request->validate([
        'id' => 'required|integer', // 🔄 validate id instead of job_card_no
        'job_card_no' => 'required|string',
        'plate_number' => 'required|string',
        'customer_name' => 'required|string',
        'repair_category' => 'required|array',
        'sparedetails' => 'required|array',
    ]);

    foreach ($validated['sparedetails'] as $detail) {
        PendingRequestedItem::create([
            'job_card_no' => $validated['job_card_no'],
            'plate_number' => $validated['plate_number'],
            'customer_name' => $validated['customer_name'],
            'part_number' => $detail['partnumber'],
            'description' => $detail['description'] ?? null,
            'brand' => $detail['brand'] ?? null,
            'model' => $detail['model'] ?? null,
            'request_quantity' => $detail['requestquantity'],
            'unit_price' => $detail['unit_price'],
            'total_price' => $detail['requestquantity'] * $detail['unit_price'],
            'status' => 'Pending',
        ]);
    }

    // ✅ Delete by ID instead of job_card_no
    $spareRequest = SpareRequest::find($validated['id']);

    if (!$spareRequest) {
        return response()->json(['message' => 'Original request not found'], 404);
    }

    $spareRequest->delete();

    return response()->json([
        'message' => 'Item added to Pending Requests and original request deleted',
    ], 201);
}


    public function index() {
        try {
            $pendingItems = PendingRequestedItem::all();
            return response()->json($pendingItems, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching pending requests', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id) {
        $pendingItem = PendingRequestedItem::find($id);
    
        if (!$pendingItem) {
            return response()->json(['message' => 'Item not found'], 404);
        }
    
        $pendingItem->delete();
    
        return response()->json(['message' => 'Item removed from pending requests'], 200);
    }

    
public function storeItemOut(Request $request, $id) {
    $pendingItem = PendingRequestedItem::find($id);

    if (!$pendingItem) {
        return response()->json(['message' => 'Item not found'], 404);
    }

    // ✅ Move item to `request_item_out` table
    RequestItemOut::create([
        'job_card_no' => $pendingItem->job_card_no,
        'plate_number' => $pendingItem->plate_number,
        'customer_name' => $pendingItem->customer_name,
        'part_number' => $pendingItem->part_number,
        'description' => $pendingItem->description,
        'brand' => $pendingItem->brand,
        'model' => $pendingItem->model,
        'request_quantity' => $pendingItem->request_quantity,
        'unit_price' => $pendingItem->unit_price,
        'total_price' => $pendingItem->total_price,
        'status' => 'Approved',
    ]);

    // ✅ Remove item from `pending_requested_items`
    $pendingItem->delete();

    return response()->json(['message' => 'Item moved to Item Out'], 200);
}

    
    
}