<?php

namespace App\Http\Controllers;

use App\Models\SpareChange;
use Illuminate\Http\Request;

class SpareChangeController extends Controller
{
   
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'job_card_no' => 'required',
            'plate_number' => 'required',
            'customer_name' => 'required',
            'repair_category' => 'required|array',
            'spare_change' => 'required|array',



         
        ]);
    
        $workOrder = SpareChange::create($validatedData);
    
        return response()->json($workOrder, 201);
    }

  

    public function index()
    {
        $workOrders = SpareChange::all();
        
        return response()->json([
            'data' => $workOrders
        ]);
    }
    public function getRecentIncoming() {
        try {
            // ✅ Fetch the latest 10 requests, sorted by `created_at`
            $recentRequests = SpareChange::orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
    
            return response()->json($recentRequests, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching recent requests', 'error' => $e->getMessage()], 500);
        }
    }
    public function showByJobCardNo($job_card_no)
    {
        $workOrders = SpareChange::where('job_card_no', $job_card_no)->get();
    
        if ($workOrders->isEmpty()) {
            return response()->json(['message' => 'Work orders not found'], 404);
        }
    
        // Merging all `work_details` from multiple rows into one array
        $mergedWorkDetails = $workOrders->flatMap(fn ($workOrder) => $workOrder->spare_change)->all();
    
        // Returning only one object with all work details merged
        $groupedData = [
            'job_card_no' => $job_card_no,
            'plate_number' => $workOrders->first()->plate_number,
            'customer_name' => $workOrders->first()->customer_name,
            'repair_category' => $workOrders->first()->repair_category,
            'spare_change' => $mergedWorkDetails, // ✅ All work details combined
        ];
    
        return response()->json($groupedData, 200);
    }
    public function getWorkOrdersByJobCard()
        {
            $workOrders = SpareChange::orderBy('job_card_no', 'asc')->get();
            return response()->json(['data' => $workOrders], 200);
        }
    
    
    
        public function deleteWorkDetail($workDetailId)
    {
        $workOrder = SpareChange::whereJsonContains('spare_change', [['id' => (int) $workDetailId]])->first();
    
        if (!$workOrder) {
            return response()->json(['message' => 'Work detail not found'], 404);
        }
        // Filter out the work detail with the given ID
        $updatedWorkDetails = collect($workOrder->spare_change)->reject(function ($detail) use ($workDetailId) {
            return $detail['id'] == $workDetailId;
        })->values()->all();
    
        // Update the work order with the filtered sparedetails
        $workOrder->update(['spare_change' => $updatedWorkDetails]);
        return response()->json(['message' => 'Spare detail deleted successfully'], 200);
    }
    
    
    
    
    public function updateSpareDetail(Request $request, $workDetailId)
    {
        try {
            $validatedData = $request->validate([
                'itemname' => 'nullable|string',
                'partnumber' => 'nullable|string',
                'requestquantity' => 'nullable|string',
                'brand' => 'nullable|string',
                'condition' => 'nullable|string',
                'unitprice' => 'nullable|string',
                'totalprice' => 'nullable|string',
            
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422); // ✅ Return validation errors
        }
    
        // Find work order
        $workOrder = SpareChange::all()->first(function ($order) use ($workDetailId) {
            return collect($order->spare_change)->contains('id', (int) $workDetailId);
        });
    
        if (!$workOrder) {
            return response()->json(['message' => 'Spare detail not found'], 404);
        }
    
        // Update specific spare detail
        $updatedWorkDetails = collect($workOrder->spare_change)->map(function ($detail) use ($workDetailId, $validatedData) {
            if (isset($detail['id']) && $detail['id'] == $workDetailId) {
                return array_merge($detail, $validatedData);
            }
            return $detail;
        })->all();
    
        $workOrder->update(['spare_change' => $updatedWorkDetails]);
    
        return response()->json(['message' => 'Spare detail updated successfully', 'spare_change' => $updatedWorkDetails], 200);
    }





}
