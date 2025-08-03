<?php

namespace App\Http\Controllers;

use App\Models\WorkProgress;
use Illuminate\Http\Request;

class WorkProgressController extends Controller
{
    // Store work progress
    public function store(Request $request)
    {
        $request->validate([
            'job_card_no' => 'required|exists:work_orders,id',
            'plate_number' => 'required|string',
            'customer_name' => 'required|string',
            'repair_category' => 'required', // Validation remains the same
            'work_details' => 'required|array',
        ]);
    
        foreach ($request->work_details as $work) {
            WorkProgress::create([
                'job_card_no' => $request->job_card_no,
                'plate_number' => $request->plate_number,
                'customer_name' => $request->customer_name,
                'repair_category' => is_array($request->repair_category) 
                    ? implode(", ", $request->repair_category)  // Convert array to string
                    : $request->repair_category,
                'work_description' => $work['workDescription'],
                'assigned_to' => $work['AssignTo'],
                'time_in' => $work['TimeIn'],
                'time_out' => $work['TimeOut'],
                'status' => $work['status'],
                'progress' => $work['Progress'],
                'remark' => $work['Remark'],
            ]);
        }
    
        return response()->json(['message' => 'Work progress saved successfully'], 201);
    }
    

    public function index($job_card_no)
{
    $workProgress = WorkProgress::where('job_card_no', $job_card_no)->get();

    if ($workProgress->isEmpty()) {
        return response()->json(['message' => 'No work progress found'], 404);
    }

    return response()->json($workProgress, 200);
}

}
