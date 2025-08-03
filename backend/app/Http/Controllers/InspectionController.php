<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\Request;

class InspectionController extends Controller
{
    
     public function index(){

        $inspect = Inspection::all();
        return response()->json(['data'=> $inspect], 200 );
     }
    


    public function store(Request $request)
    {
        // Generate job_id
    $lastJob = Inspection::latest('job_id')->first(); // Use Inspection model instead of BolloController
    $nextJobId = $lastJob ? str_pad(((int) $lastJob->job_id) + 1, 4, '0', STR_PAD_LEFT) : '0001';

    // Check if job_id already exists
    while (Inspection::where('job_id', $nextJobId)->exists()) {
        $nextJobId = str_pad(((int) $nextJobId) + 1, 4, '0', STR_PAD_LEFT);
    }
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'customer_type'=> 'required|string|max:255',
        'phone_number'=> 'required|string|max:255',
        'tin_number'=> 'required|string|max:255',
        'result'=> 'required|string|max:255',
        'total_payment'=> 'required|string|max:255',
        'checked_by' => 'required|string|max:255',
        'plate_number'=> 'required|string|max:255',
        'make'=> 'required|string|max:255',
        'model'=> 'required|string|max:255',
        'year'=> 'required|string|max:255',
        ]);

        
         // Add job_id to the validated data
        $validated['job_id'] = $nextJobId;
        Inspection::create($validated);

        return response()->json(['message' => ' Inspection is  registered successfully!'], 201);
    
    
    }

    public function show($id)
    {
        // Find the Inspection record by ID
        $inspection = Inspection::find($id);

        // Check if the record exists
        if (!$inspection) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        // Return the record as JSON
        return response()->json($inspection);
    }
    public function update(Request $request, $id)
    {
        // Find the record
        $inspection = Inspection::find($id);

        // Check if the record exists
        if (!$inspection) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        // Validate the incoming request
        $validatedData = $request->validate([
            'job_id' => 'required|string|unique:inspections,job_id,' . $inspection->id,
            'customer_name' => 'required|string|max:255',
            'customer_type' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'tin_number' => 'nullable|string|max:20',
            'result' => 'nullable|string',
            'total_payment' => 'nullable|numeric',
            'checked_by' => 'nullable|string|max:255',
            'plate_number' => 'nullable|string|max:50',
            'make' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'year' => 'nullable|integer',
        ]);

        // Update the record with validated data
        $inspection->update($validatedData);

        return response()->json(['message' => 'Record updated successfully', 'data' => $inspection]);
    }
    public function destroy($id)
    {
        $inspection = Inspection::find($id);
    
        if (!$inspection) {
            return response()->json(['message' => 'inspection not found'], 404);
        }
    
        $inspection->delete();
        return response()->json(['message' => 'inspection deleted successfully'], 200);
    }


    public function deleteRepairs(Request $request)
{
    // Debugging: Check if repair_ids is passed correctly
    // dd($request->repair_ids); // Uncomment for debugging purposes

    // Validation for the repair_ids array
    $request->validate([
        'repair_ids' => 'required|array', // repair_ids must be an array
        'repair_ids.*' => 'exists:inspections,id' // Each id must exist in the repair_registrations table
    ]);

    // Delete the repairs
    $deleted = Inspection::whereIn('id', $request->repair_ids)->delete();

    // Check if any records were deleted
    if ($deleted > 0) {
        return response()->json(['message' => 'Selected repairs deleted successfully']);
    } else {
        return response()->json(['message' => 'No repairs found to delete'], 404);
    }
}
}
