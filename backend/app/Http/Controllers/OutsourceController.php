<?php

namespace App\Http\Controllers;
use App\Models\outsource;
use Illuminate\Http\Request;

class OutsourceController extends Controller
{
    
    public function index() {
       
        $workOrders = outsource::all(); 
        // Return the data as a JSON response
        return response()->json([
            'data' => $workOrders
        ]);
    }


//    // Store a new outsource
//    public function store(Request $request)
// {
//     $validated = $request->validate([
//         'job_card_no' => 'required|string',
//         'plate_number' => 'nullable|string',
//         'customer_name' => 'nullable|string',
//         'repair_category' => 'nullable|array', // ✅ Allow array
//         'repair_category.*' => 'string', // ✅ Ensure each item is a string
//         'outsourcedetails' => 'required|array', // ✅ Allow array
//         'outsourcedetails.*.description' => 'required|string', // ✅ Validate each field inside array
//         'outsourcedetails.*.requestedby' => 'required|string',
//         // 'outsourcedetails.*.assign_to' => 'required|string',
//         'outsourcedetails.*.condition' => 'nullable|string',
//         'outsourcedetails.*.modal' => 'required|string',
//         'outsourcedetails.*.brand' => 'required|numeric',
//         'outsourcedetails.*.description' => 'nullable|string',
//         // 'outsourcedetails.*.remark' => 'nullable|string',
        
//     ]);

//     $outsource = outsource::create([
//         'job_card_no' => $validated['job_card_no'],
//         'plate_number' => $validated['plate_number'],
//         'customer_name' => $validated['customer_name'],
//         'repair_category' => json_encode($validated['repair_category']), // ✅ Convert to JSON before saving
//         'outsourcedetails' => json_encode($validated['outsourcedetails']), // ✅ Convert to JSON before saving
       
//     ]);

//     return response()->json([
//         'message' => 'Outsource request saved successfully!',
//         'data' => $outsource
//     ], 201);
// }
public function store(Request $request)
{
    $validatedData = $request->validate([
        'job_card_no' => 'required',
        'plate_number' => 'nullable',
        'customer_name' => 'required',
        'repair_category' => 'nullable',
        'outsourcedetails' => 'required|array',
    ]);

    $workOrder = outsource::create($validatedData);

    return response()->json($workOrder, 201);
}

public function showByJobCardNo($job_card_no)
{
    $workOrders = outsource::where('job_card_no', $job_card_no)->get();

    if ($workOrders->isEmpty()) {
        return response()->json(['message' => 'Work orders not found'], 404);
    }

    // Merging all `work_details` from multiple rows into one array
    $mergedWorkDetails = $workOrders->flatMap(fn ($workOrder) => $workOrder->outsourcedetails)->all();

    // Returning only one object with all work details merged
    $groupedData = [
        'job_card_no' => $job_card_no,
        'plate_number' => $workOrders->first()->plate_number,
        'customer_name' => $workOrders->first()->customer_name,
        'repair_category' => $workOrders->first()->repair_category,
        'outsourcedetails' => $mergedWorkDetails, // ✅ All work details combined
    ];

    return response()->json($groupedData, 200);
}


public function show($id) {
    $outsource = outsource::findOrFail($id);
    return response()->json($outsource);
}

    /**
     * Update the specified resource in storage.
     */
    // Update a task
    // public function update(Request $request, $id) {
    //     $task = Task::find($id);
    //     if (!$task) return response()->json(['message' => 'Task not found'], 404);

    //     $task->update($request->all());
    //     return response()->json($task, 200);
    // }

    /**
     * Remove the specified resource from storage.
     */
    // Delete a task
    // public function destroy($id) {
    //     $task = Task::find($id);
    //     if (!$task) return response()->json(['message' => 'Task not found'], 404);

    //     $task->delete();
    //     return response()->json(['message' => 'Task deleted successfully'], 200);
    // }

    public function deleteWorkDetail($workDetailId)
    {
        $workOrder = outsource::whereJsonContains('outsourcedetails', [['id' => (int) $workDetailId]])->first();
    
        if (!$workOrder) {
            return response()->json(['message' => 'Work detail not found'], 404);
        }
    
        // Filter out the work detail with the given ID
        $updatedWorkDetails = collect($workOrder->outsourcedetails)->reject(function ($detail) use ($workDetailId) {
            return $detail['id'] == $workDetailId;
        })->values()->all();
    
        // Update the work order with the filtered outsourcedetails
        $workOrder->update(['outsourcedetails' => $updatedWorkDetails]);
    
        return response()->json(['message' => 'Work detail deleted successfully'], 200);
    }



    public function updateOutsourceDetail(Request $request, $workDetailId)
{
    // Validate request
    $validatedData = $request->validate([
        'partnumber' => 'nullable|string',
        'requestquantity' => 'nullable|string',
        'modal' => 'nullable|date',
        'brand' => 'nullable|date',
        'description' => 'nullable|string',
    ]);

    // Find the work order containing the work detail
    $workOrder = outsource::whereJsonContains('outsourcedetails', [['id' => (int) $workDetailId]])->first();

    if (!$workOrder) {
        return response()->json(['message' => 'Outsource detail not found'], 404);
    }

    // Modify the specific outsource detail in the JSON array
    $updatedOutsourceDetails = collect($workOrder->outsourcedetails)->map(function ($detail) use ($workDetailId, $validatedData) {
        if ($detail['id'] == $workDetailId) {
            return array_merge($detail, $validatedData); // Update matched detail
        }
        return $detail;
    })->all();

    // Save the updated outsource details
    $workOrder->update(['outsourcedetails' => $updatedOutsourceDetails]);

    return response()->json([
        'message' => 'Outsource detail updated successfully',
        'outsourcedetails' => $updatedOutsourceDetails
    ], 200);
}

}
