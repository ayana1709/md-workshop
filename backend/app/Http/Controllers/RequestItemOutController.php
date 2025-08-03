<?php

namespace App\Http\Controllers;

use App\Models\RequestItemOut;
use App\Models\Item;
use App\Models\SpareRequest;
use App\Models\PendingItemOut;
use App\Models\CanceledRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // ✅ Use DB for transactions

class RequestItemOutController extends Controller {
    public function store(Request $request) {
        try {
            $validated = $request->validate([
                'job_card_no' => 'required|string',
                'plate_number' => 'required|string',
                'customer_name' => 'required|string',
                'repair_category' => 'required|array',
                'sparedetails' => 'required|array',
            ]);
    
            DB::beginTransaction(); // ✅ Start Transaction
    
            $spareRequestId = null; // Variable to store SpareRequest ID
    
            foreach ($validated['sparedetails'] as $detail) {
                if (!isset($detail['partnumber'])) {
                    return response()->json(['message' => 'Missing part number in request.'], 400);
                }
    
                $item = Item::where('part_number', $detail['partnumber'])->first();
    
                if (!$item) {
                    return response()->json([
                        'message' => "Item with part number {$detail['partnumber']} not found in inventory."
                    ], 400);
                }
    
                if ($item->quantity < $detail['requestquantity']) {
                    return response()->json([
                        'message' => "Not enough quantity in store for part number {$detail['partnumber']}."
                    ], 400);
                }
    
                // ✅ Insert into `request_item_out`
                RequestItemOut::create([
                    'job_card_no' => $validated['job_card_no'],
                    'plate_number' => $validated['plate_number'],
                    'customer_name' => $validated['customer_name'],
                    'part_number' => $item->part_number,
                    'description' => $item->description ?? null,
                    'brand' => $item->brand ?? null,
                    'model' => $item->model ?? null,
                    'request_quantity' => $detail['requestquantity'],
                    'requested_by' => $detail['requestedby'],
                    'unit_price' => $item->unit_price,
                    'total_price' => $detail['requestquantity'] * $item->unit_price,
                    'status' => 'Pending',
                ]);
    
                // ✅ Reduce quantity in `items`
                $item->decrement('quantity', $detail['requestquantity']);
    
                // ✅ Store SpareRequest ID for later deletion
                if (isset($detail['id'])) {
                    $spareRequestId = $detail['id'];
                }
            }
    
            // ✅ Delete the entire SpareRequest entry if an ID was found
            if ($spareRequestId) {
                SpareRequest::where('id', $spareRequestId)->delete();
            }
    
            DB::commit(); // ✅ Commit transaction
    
            return response()->json(['message' => 'Item moved to Requested Item Out, inventory updated, and Spare Request removed'], 201);
        } catch (\Exception $e) {
            DB::rollBack(); // ❌ Rollback on error
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    public function getRequestedItems()
{
    try {
        $requestedItems = RequestItemOut::all();

        return response()->json($requestedItems);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
    }
}

public function storePendingItemOut(Request $request) {
    try {
        $validated = $request->validate([
            'job_card_no' => 'required|string',
            'plate_number' => 'required|string',
            'customer_name' => 'required|string',
            'sparedetails' => 'required|array',
        ]);

        foreach ($validated['sparedetails'] as $detail) {
            if (!isset($detail['partnumber'])) {
                return response()->json(['message' => 'Missing part number in request.'], 400);
            }

            // ✅ Store data in `pending_item_out` table
            PendingItemOut::create([
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

        return response()->json(['message' => 'Item stored in Pending Item Out table'], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
    }
}
public function getPendingItemOut() {
    try {
        // ✅ Fetch all pending item out records
        $pendingItems = RequestItemOut::where('status', 'Pending')->get();

        return response()->json($pendingItems, 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Server Error: ' . $e->getMessage()
        ], 500);
    }
}

public function cancelRequest($id) {
    try {
        // ✅ Find the spare request by ID
        $spareRequest = SpareRequest::find($id);

        if (!$spareRequest) {
            return response()->json(['message' => 'Spare request not found.'], 404);
        }

        // ✅ Start a database transaction
        DB::beginTransaction();

        // ✅ Ensure `sparedetails` is an array
        $spareDetailsArray = is_array($spareRequest->sparedetails) 
            ? $spareRequest->sparedetails 
            : json_decode($spareRequest->sparedetails, true);

        if (!$spareDetailsArray) {
            return response()->json(['message' => 'Invalid sparedetails data.'], 400);
        }

        // ✅ Loop through spare details and store in `canceled_requests`
        foreach ($spareDetailsArray as $spareDetails) {
            CanceledRequest::create([
                'job_card_no'     => $spareRequest->job_card_no,
                'plate_number'    => $spareRequest->plate_number,
                'customer_name'   => $spareRequest->customer_name,
                'part_number'     => $spareDetails['partnumber'] ?? null,
                'description'     => $spareDetails['description'] ?? null,
                'brand'           => $spareDetails['brand'] ?? null,
                'model'           => $spareDetails['model'] ?? null,
                'request_quantity'=> $spareDetails['requestquantity'] ?? 0,
                'request_by'      => $spareDetails['requestedby'] ?? null,
                'unit_price'      => $spareDetails['unit_price'] ?? 0,
                'total_price'     => ($spareDetails['requestquantity'] ?? 0) * ($spareDetails['unit_price'] ?? 0),
                'status'          => 'Canceled'
            ]);
        }

        // ✅ Delete the request from `spare_requests`
        $spareRequest->delete();

        // ✅ Commit transaction
        DB::commit();

        return response()->json(['message' => 'Request successfully canceled.'], 200);
    } catch (\Exception $e) {
        // ❌ Rollback in case of an error
        DB::rollBack();
        return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
    }
}


public function getCanceledRequests() {
    try {
        // ✅ Fetch all canceled requests
        $canceledRequests = CanceledRequest::all();

        return response()->json($canceledRequests, 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
    }
}





    
}
