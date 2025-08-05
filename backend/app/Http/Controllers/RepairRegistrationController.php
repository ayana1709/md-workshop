<?php

namespace App\Http\Controllers;

use App\Models\PostDriveTest;
use App\Models\RepairRegistration;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class RepairRegistrationController extends Controller
{
public function index()
{
    try {
        $repairs = RepairRegistration::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $repairs->count(),
            'data' => $repairs
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error fetching repairs',
            'error' => $e->getMessage()
        ], 500);
    }
}


    
    
   



public function store(Request $request)
{
    if (!$request->isMethod('post')) {
        return response()->json(['error' => 'Invalid request method'], 405);
    }

    $payload = json_decode($request->input('payload'), true);

    if (!$payload) {
        return response()->json(['message' => 'Invalid JSON payload'], 400);
    }

    $validated = validator($payload, [
        'customer_name' => 'required|string|max:255',
        'customer_type' => 'required|string|max:255',
        'mobile' => 'required|string|max:20',
        'types_of_jobs' => 'nullable|string',
        'received_date' => 'required|date',
        'estimated_date' => 'nullable|string',
        'promise_date' => 'nullable|date',
        'priority' => 'required|string',
        'product_name' => 'nullable|string|max:255', // ✅ added
        'serial_code' => 'nullable|string|max:255',  // ✅ added
        'customer_observation' => 'nullable|array',
        'spare_change' => 'nullable|array',
        'job_description' => 'nullable|array',
        'received_by' => 'nullable|string',
    ])->validate();

    try {
        // Generate job_id
        $lastJob = RepairRegistration::latest('job_id')->first();
        $nextJobId = $lastJob ? str_pad(((int)$lastJob->job_id) + 1, 4, '0', STR_PAD_LEFT) : '0001';

        while (RepairRegistration::where('job_id', $nextJobId)->exists()) {
            $nextJobId = str_pad(((int)$nextJobId) + 1, 4, '0', STR_PAD_LEFT);
        }

        // Handle image upload (single image)
       $imagePath = null;
if ($request->hasFile('image')) {
    $file = $request->file('image');
    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    
    // Store file in storage/app/public/repair_images
    $file->storeAs('public/repair_images', $filename);
    
    // Save only relative path for access from /storage
    $imagePath = 'repair_images/' . $filename;
}


        // Create repair registration
        $repair = new RepairRegistration();
        $repair->job_id = $nextJobId;
        $repair->customer_name = $payload['customer_name'];
        $repair->customer_type = $payload['customer_type'];
        $repair->mobile = $payload['mobile'];
        $repair->types_of_jobs = $payload['types_of_jobs'] ?? null;
        $repair->received_date = $payload['received_date'];
        $repair->estimated_date = $payload['estimated_date'] ?? null;
        $repair->promise_date = $payload['promise_date'] ?? null;
        $repair->priority = $payload['priority'];
        $repair->product_name = $payload['product_name'] ?? null; // ✅ added
        $repair->serial_code = $payload['serial_code'] ?? null;   // ✅ added
        $repair->customer_observation = $payload['customer_observation'] ?? null;
        $repair->spare_change = $payload['spare_change'] ?? null;
        $repair->job_description = $payload['job_description'] ?? null;
        $repair->received_by = $payload['received_by'] ?? null;
        $repair->image = $imagePath;
        

        $repair->save();

        return response()->json([
            'message' => 'Repair created successfully',
            'job_id' => $repair->job_id
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error storing repair',
            'error' => $e->getMessage()
        ], 500);
    }
}

    
public function update(Request $request, $id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found'], 404);
    }

    // 👇 Decode JSON from 'payload'
    $payload = json_decode($request->input('payload'), true);

    if (!$payload) {
        return response()->json(['message' => 'Invalid JSON payload'], 400);
    }

    // ✅ Validate decoded payload
    $validated = validator($payload, [
        'job_id' => 'required|string|unique:repair_registrations,job_id,' . $repair->id,
        'customer_name' => 'required|string|max:255',
        'customer_type' => 'required|string|max:255',
        'mobile' => 'required|string|max:20',
        'types_of_jobs' => 'nullable|string',
        'received_date' => 'required|date',
        'estimated_date' => 'nullable|string',
        'promise_date' => 'nullable|date',
        'priority' => 'required|string',
        'product_name' => 'nullable|string|max:255',
        'serial_code' => 'nullable|string|max:255',
        'customer_observation' => 'nullable|array',
        'spare_change' => 'nullable|array',
        'job_description' => 'nullable|array',
        'received_by' => 'nullable|string',
    ])->validate();

    try {
        // ✅ Handle optional new image
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/repair_images', $filename);
            $validated['image'] = 'repair_images/' . $filename;
        }

        // ✅ Update all fields (including image if uploaded)
        $repair->update($validated);

        return response()->json(['message' => 'Repair updated successfully'], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error updating repair',
            'error' => $e->getMessage()
        ], 500);
    }
}





public function destroy($id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found'], 404);
    }

    $repair->delete();

    return response()->json(['message' => 'Repair deleted successfully'], 200);
}


public function show($id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found.'], 404);
    }

    return response()->json([
        'id' => $repair->id,
        'job_id' => $repair->job_id,
        'customer_name' => $repair->customer_name,
        'customer_type' => $repair->customer_type,
        'mobile' => $repair->mobile,
        'types_of_jobs' => $repair->types_of_jobs,
        'product_name' => $repair->product_name,
        'serial_code' => $repair->serial_code,
        'received_date' => $repair->received_date,
        'estimated_date' => $repair->estimated_date,
        'promise_date' => $repair->promise_date,
        'priority' => $repair->priority,
        'received_by' => $repair->received_by,
        'status' => $repair->status,
        'customer_observation' => $repair->customer_observation,
        'spare_change' => $repair->spare_change,
        'job_description' => $repair->job_description,
        'image_url' => $repair->image ? asset('storage/' . $repair->image) : null,
    ]);
}

public function showBasicInfo($id)
{
    try {
        $repair = RepairRegistration::find($id);

        if (!$repair) {
            return response()->json(['message' => 'Repair not found.'], 404);
        }

        return response()->json([
            'customer_name'   => $repair->customer_name,
            'product_name'    => $repair->product_name,
            'serial_code'     => $repair->serial_code,
            'types_of_jobs'   => $repair->types_of_jobs,
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Server error'], 500);
    }
}









public function getVehiclesByRepairId($id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found'], 404);
    }

    return response()->json(['vehicles' => $repair->vehicles]);
}


public function totalRepairs()
{
    try {
        $count = RepairRegistration::count();
        return response()->json(['total_repairs' => $count]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error fetching total repairs', 'message' => $e->getMessage()], 500);
    }
}



public function deleteRepairs(Request $request)
{
    // Debugging: Check if repair_ids is passed correctly
    // dd($request->repair_ids); // Uncomment for debugging purposes

    // Validation for the repair_ids array
    $request->validate([
        'repair_ids' => 'required|array', // repair_ids must be an array
        'repair_ids.*' => 'exists:repair_registrations,id' // Each id must exist in the repair_registrations table
    ]);

    // Delete the repairs
    $deleted = RepairRegistration::whereIn('id', $request->repair_ids)->delete();

    // Check if any records were deleted
    if ($deleted > 0) {
        return response()->json(['message' => 'Selected repairs deleted successfully']);
    } else {
        return response()->json(['message' => 'No repairs found to delete'], 404);
    }
}


public function updateStatus(Request $request, $id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['error' => 'Repair registration not found'], 404);
    }

    $repair->status = $request->status; // Get the new status from request
    $repair->save();

    return response()->json(['message' => 'Status updated successfully!', 'status' => $repair->status]);
}

public function updatestat(Request $request, $id)
{
    $repair = RepairRegistration::find($id);
    if (!$repair) {
        return response()->json(['message' => 'Repair not found.'], 404);
    }

    $repair->status = $request->input('status');
    $repair->save();

    return response()->json(['message' => 'Status updated successfully.']);
}
public function getByJobId($jobId)
{
    $repair = RepairRegistration::with('vehicles')
        ->where('job_id', $jobId)
        ->first();

    if (!$repair) {
        return response()->json(['message' => 'Repair not found.'], 404);
    }

    return response()->json([
        'job_id' => $repair->job_id,
        'plate_no' => optional($repair->vehicles->first())->plate_no,
        'received_date' => $repair->received_date,
        'promise_date' => $repair->promise_date,
        'status' => $repair->status,
    ]);
}



public function getBatchByJobIds(Request $request)
{
    $jobIds = $request->input('job_ids', []);

    $repairs = RepairRegistration::with('vehicles')
        ->whereIn('job_id', $jobIds)
        ->get();

    // Make sure testDrives keys are padded
    $testDrives = PostDriveTest::whereIn('job_card_no', $jobIds)
        ->get()
        ->keyBy(function ($item) {
            return str_pad($item->job_card_no, 4, '0', STR_PAD_LEFT);
        });

    $result = [];

    foreach ($repairs as $repair) {
        $jobId = str_pad($repair->job_id, 4, '0', STR_PAD_LEFT);
        $vehicle = $repair->vehicles->first();

        $testDrive = $testDrives[$jobId] ?? null;

        $result[$jobId] = [
            'plate_no' => $vehicle?->plate_no,
            'start_date' => $repair->received_date,
            'end_date' => $repair->promise_date,
            'status' => $repair->status,
            'received_date' => $testDrive?->checked_date ?? null,
            'technician_final_approval' => $testDrive?->technician_final_approval ?? null,
        ];
    }

    return response()->json($result);
}







}
