<?php

namespace App\Http\Controllers;

use App\Models\WheelAlignemnt;
use App\Models\WheelAlignment;
use Illuminate\Http\Request;

class WheelAlignemntController extends Controller
{
 
    public function index()
    {
        $wheel = WheelAlignemnt::all(); // Fetch all records
        return response()->json(['data' => $wheel], 200);
    }//


    public function store(Request $request)
    {
             // Generate job_id
    $lastJob = WheelAlignemnt::latest('job_id')->first(); // Use WheelAlignemnt model instead of BolloController
    $nextJobId = $lastJob ? str_pad(((int) $lastJob->job_id) + 1, 4, '0', STR_PAD_LEFT) : '0001';

    // Check if job_id already exists
    while (WheelAlignemnt::where('job_id', $nextJobId)->exists()) {
        $nextJobId = str_pad(((int) $nextJobId) + 1, 4, '0', STR_PAD_LEFT);
    }
        $validated = $request->validate([
            'job_card_no' => 'required|string|max:255',
            'date' => 'required|date',
            'customer_name' => 'required|string|max:255',
            'customer_type' => 'required|string|in:Regular,Contract',
            'mobile' => 'required|string|max:20',
            'tin_number' => 'nullable|string|max:50',
            'checked_date' => 'required|date',
            'work_description' => 'required|string',
            'result' => 'required|string',
            'total_amount' => 'required|numeric|min:0',
            'professional' => 'required|string|max:255',
            'checked_by' => 'required|string|max:255',
        ]);

        // Add job_id to the validated data
        $validated['job_id'] = $nextJobId;
        WheelAlignemnt::create($validated);

        return response()->json(['message' => ' WheelAlignement  is  registered successfully!'], 201);
    
    
    }

      // 3. Update (edit) a job card by ID
      public function update(Request $request, $id)
      {
          $wheel = WheelAlignemnt::find($id);
      
          if (!$wheel) {
              return response()->json(['message' => 'Job Card not found'], 404);
          }
      
          // Validate the incoming request data
          $validatedData = $request->validate([
            'job_id' => 'required|string|unique:wheel_alignemnts,job_id,' . $wheel->id,
              'job_card_no' => 'string|nullable',
              'date' => 'date|nullable',
              'customer_name' => 'string|nullable',
              'customer_type' => 'string|nullable',
              'mobile' => 'string|nullable',
              'tin_number' => 'string|nullable',
              'checked_date' => 'date|nullable',
              'work_description' => 'string|nullable',
              'result' => 'string|nullable',
              'total_amount' => 'numeric|nullable',
              'professional' => 'string|nullable',
              'checked_by' => 'string|nullable',
          ]);
      
          // Update only the specified fields, excluding created_at and updated_at
          $wheel->update($request->except(['created_at', 'updated_at']));
      
          return response()->json([
              'message' => 'Job Card updated successfully',
              'data' => $wheel
          ], 200);
      }
      


      public function show($id)
{
    $wheel = WheelAlignemnt::find($id);

    if (!$wheel) {
        return response()->json(['message' => 'Job card not found'], 404);
    }

    // Exclude created_at and updated_at from response
    return response()->json($wheel->makeHidden(['created_at', 'updated_at']));
}

public function destroy($id)
{
    $wheel = WheelAlignemnt::find($id);

    if (!$wheel) {
        return response()->json(['message' => 'wheel not found'], 404);
    }

    $wheel->delete();
    return response()->json(['message' => 'wheel deleted successfully'], 200);
}


public function deleteRepairs(Request $request)
{
    // Debugging: Check if repair_ids is passed correctly
    // dd($request->repair_ids); // Uncomment for debugging purposes

    // Validation for the repair_ids array
    $request->validate([
        'repair_ids' => 'required|array', // repair_ids must be an array
        'repair_ids.*' => 'exists:wheel_alignemnts,id' // Each id must exist in the repair_registrations table
    ]);

    // Delete the repairs
    $deleted = WheelAlignemnt::whereIn('id', $request->repair_ids)->delete();

    // Check if any records were deleted
    if ($deleted > 0) {
        return response()->json(['message' => 'Selected repairs deleted successfully']);
    } else {
        return response()->json(['message' => 'No repairs found to delete'], 404);
    }
}

      
}


