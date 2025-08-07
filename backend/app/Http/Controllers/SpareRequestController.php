<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SpareRequest;
use App\Models\Item;

class SpareRequestController extends Controller {
    
    public function store(Request $request)
{
    $validatedData = $request->validate([
        'job_card_no' => 'required',
        'plate_number' => 'nullable',
        'customer_name' => 'required',
        'repair_category' => 'nullable',
        'sparedetails' => 'required|array',
    ]);

    $updatedSpareDetails = [];

   foreach ($validatedData['sparedetails'] as $detail) {
    $status = "Not in store"; // Default
    $unitPrice = null;

    $partNumber = trim(strtolower($detail['partnumber']));

    $item = Item::whereRaw('LOWER(TRIM(part_number)) = ?', [$partNumber])->first();

    if ($item) {
        if ($detail['requestquantity'] > $item->quantity) {
            $status = "Insufficient";
        } else {
            $status = "Available";
        }

        $unitPrice = $item->unit_price;
    }

    $updatedSpareDetails[] = [
        'id' => $detail['id'],
        'itemname' => $detail['itemname'] ?? null,
        'partnumber' => $detail['partnumber'],
        'brand' => $detail['brand'] ?? null,
        'model' => $detail['model'] ?? null,
        'condition' => $detail['condition'] ?? null,
        'description' => $detail['description'] ?? null,
        'requestquantity' => $detail['requestquantity'],
        'requestedby' => $detail['requestedby'] ?? null,
        'status' => $status,
        'unit_price' => $unitPrice,
        'totalprice' => $detail['totalprice'] ?? null,
    ];
}


    // Store the spare request with updated spare details as an array
    $spareRequest = SpareRequest::create([
        'job_card_no' => $validatedData['job_card_no'],
        'plate_number' => $validatedData['plate_number'],
        'customer_name' => $validatedData['customer_name'],
        'repair_category' => $validatedData['repair_category'],
        'sparedetails' => $updatedSpareDetails, // ✅ Store directly as an array
    ]);

    return response()->json([
        'message' => 'Spare request created successfully',
        'data' => $spareRequest
    ], 201);
}

    



public function index()
{
    $workOrders = SpareRequest::all();
    
    return response()->json([
        'data' => $workOrders
    ]);
}
public function getRecentIncoming() {
    try {
        // ✅ Fetch the latest 10 requests, sorted by `created_at`
        $recentRequests = SpareRequest::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($recentRequests, 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error fetching recent requests', 'error' => $e->getMessage()], 500);
    }
}
public function showByJobCardNo($job_card_no)
{
    $workOrders = SpareRequest::where('job_card_no', $job_card_no)->get();

    if ($workOrders->isEmpty()) {
        return response()->json(['message' => 'Work orders not found'], 404);
    }

    // Merging all `work_details` from multiple rows into one array
    $mergedWorkDetails = $workOrders->flatMap(fn ($workOrder) => $workOrder->sparedetails)->all();

    // Returning only one object with all work details merged
    $groupedData = [
        'job_card_no' => $job_card_no,
        'plate_number' => $workOrders->first()->plate_number,
        'customer_name' => $workOrders->first()->customer_name,
        'repair_category' => $workOrders->first()->repair_category,
        'sparedetails' => $mergedWorkDetails, // ✅ All work details combined
    ];

    return response()->json($groupedData, 200);
}
public function getWorkOrdersByJobCard()
    {
        $workOrders = SpareRequest::orderBy('job_card_no', 'asc')->get();
        return response()->json(['data' => $workOrders], 200);
    }



    public function deleteWorkDetail($workDetailId)
{
    $workOrder = SpareRequest::whereJsonContains('sparedetails', [['id' => (int) $workDetailId]])->first();

    if (!$workOrder) {
        return response()->json(['message' => 'Work detail not found'], 404);
    }
    // Filter out the work detail with the given ID
    $updatedWorkDetails = collect($workOrder->sparedetails)->reject(function ($detail) use ($workDetailId) {
        return $detail['id'] == $workDetailId;
    })->values()->all();

    // Update the work order with the filtered sparedetails
    $workOrder->update(['sparedetails' => $updatedWorkDetails]);
    return response()->json(['message' => 'Spare detail deleted successfully'], 200);
}




public function updateSpareDetail(Request $request, $workDetailId)
{
    try {
        $validatedData = $request->validate([
            'itemname' => 'nullable|string',
            'partnumber' => 'nullable|string',
            'model' => 'nullable|string',
            'requestquantity' => 'nullable|string',
            'requestedby' => 'nullable|string',
            'condition' => 'nullable|string',
            // 'description' => 'nullable|string',
            // 'unitprice' => 'nullable|string',
            // 'totalprice' => 'nullable|string',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['error' => $e->errors()], 422); // ✅ Return validation errors
    }

    // Find work order
    $workOrder = SpareRequest::all()->first(function ($order) use ($workDetailId) {
        return collect($order->sparedetails)->contains('id', (int) $workDetailId);
    });

    if (!$workOrder) {
        return response()->json(['message' => 'Spare detail not found'], 404);
    }

    // Update specific spare detail
    $updatedWorkDetails = collect($workOrder->sparedetails)->map(function ($detail) use ($workDetailId, $validatedData) {
        if (isset($detail['id']) && $detail['id'] == $workDetailId) {
            return array_merge($detail, $validatedData);
        }
        return $detail;
    })->all();

    $workOrder->update(['sparedetails' => $updatedWorkDetails]);

    return response()->json(['message' => 'Spare detail updated successfully', 'sparedetails' => $updatedWorkDetails], 200);
}



    
    
}