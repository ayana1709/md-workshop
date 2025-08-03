<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bolo;

class BolloController extends Controller
{


    public function index()
    {
        $bolos = Bolo::all(); // Fetch all records
        return response()->json(['data' => $bolos], 200);
    }

    public function store(Request $request)
{
    // Generate job_id
    $lastJob = Bolo::latest('job_id')->first(); // Use Bolo model instead of BolloController
    $nextJobId = $lastJob ? str_pad(((int) $lastJob->job_id) + 1, 4, '0', STR_PAD_LEFT) : '0001';

    // Check if job_id already exists
    while (Bolo::where('job_id', $nextJobId)->exists()) {
        $nextJobId = str_pad(((int) $nextJobId) + 1, 4, '0', STR_PAD_LEFT);
    }

    $validated = $request->validate([
        'job_card_no' => 'required|string',
        'customer_name' => 'required|string',
        'customer_type' => 'required|string',
        'mobile' => 'required|string',
        'tin_number' => 'required|string',
        'checked_date' => 'required|date',
        'issue_date' => 'required|date',
        'expiry_date' => 'required|date',
        'next_reminder' => 'required|date',
        'result' => 'required|string',
        'plate_number' => 'required|string',
        'vehicle_type' => 'required|string',
        'model' => 'required|string',
        'year' => 'required|string',
        'condition' => 'required|string',
        'km_reading' => 'required|string',
        'professional' => 'required|string',
        'payment_total' => 'required|numeric',
    ]);

    // Add job_id to the validated data
    $validated['job_id'] = $nextJobId;

    $bolo = Bolo::create($validated);

    return response()->json($bolo, 201);
}


    public function show($id)
    {
        $bolo = Bolo::find($id); // ❌ Removed with('vehicles')
    
        if (!$bolo) {
            return response()->json(['message' => 'Bolo not found.'], 404);
        }
    
        return response()->json([
            'id' => $bolo->id,
            'job_id' => $bolo->job_id,
            'job_card_no' => $bolo->job_card_no,
            'customer_name' => $bolo->customer_name,
            'customer_type' => $bolo->customer_type,
            'mobile' => $bolo->mobile,
            'tin_number' => $bolo->tin_number,
            'checked_date' => $bolo->checked_date,
            'issue_date' => $bolo->issue_date,
            'expiry_date' => $bolo->expiry_date,
            'next_reminder' => $bolo->next_reminder,
            'result' => $bolo->result,
            'plate_number' => $bolo->plate_number,
            'vehicle_type' => $bolo->vehicle_type,
            'model' => $bolo->model,
            'year' => $bolo->year,
            'condition' => $bolo->condition,
            'km_reading' => $bolo->km_reading,
            'professional' => $bolo->professional,
            'payment_total' => $bolo->payment_total,
        ], 200);
    }
    
    

      // Update a specific Bolo
    public function update(Request $request, $id)
    {
        $bolo = Bolo::find($id);
        if (!$bolo) {
            return response()->json(['message' => 'Bolo not found'], 404);
        }

        $validated = $request->validate([
            'job_id' => 'required|string|unique:bolos,job_id,' . $bolo->id,
            'job_card_no' => 'required|string',
            'customer_name' => 'required|string',
            'customer_type' => 'required|string',
            'mobile' => 'required|string',
            'tin_number' => 'required|string',
            'checked_date' => 'required|date',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date',
            'next_reminder' => 'required|date',
            'result' => 'required|string',
            'plate_number' => 'required|string',
            'vehicle_type' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|string',
            'condition' => 'required|string',
            'km_reading' => 'required|string',
            'professional' => 'required|string',
            'payment_total' => 'required|numeric',
        ]);

        $bolo->update($validated);
        return response()->json($bolo);
    }

    public function destroy($id)
{
    $bolo = Bolo::find($id);

    if (!$bolo) {
        return response()->json(['message' => 'bolo not found'], 404);
    }

    $bolo->delete();
    return response()->json(['message' => 'bolo deleted successfully'], 200);
}

public function deleteRepairs(Request $request)
{
    // Debugging: Check if repair_ids is passed correctly
    // dd($request->repair_ids); // Uncomment for debugging purposes

    // Validation for the repair_ids array
    $request->validate([
        'repair_ids' => 'required|array', // repair_ids must be an array
        'repair_ids.*' => 'exists:bolos,id' // Each id must exist in the repair_registrations table
    ]);

    // Delete the repairs
    $deleted =  Bolo::whereIn('id', $request->repair_ids)->delete();

    // Check if any records were deleted
    if ($deleted > 0) {
        return response()->json(['message' => 'Selected repairs deleted successfully']);
    } else {
        return response()->json(['message' => 'No repairs found to delete'], 404);
    }
}
}
