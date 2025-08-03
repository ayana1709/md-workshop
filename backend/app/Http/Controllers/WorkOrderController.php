<?php


namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\WorkDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\DailyProgress;
use Illuminate\Support\Carbon;

class WorkOrderController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'job_card_no' => 'required',
            'plate_number' => 'nullable',
            'customer_name' => 'required',
            'repair_category' => 'nullable',
            'work_details' => 'required|array',
        ]);
    
        $workOrder = WorkOrder::create($validatedData);
    
        return response()->json($workOrder, 201);
    }
    

    public function index()
{
    $workOrders = WorkOrder::all();
    
    return response()->json([
        'data' => $workOrders
    ]);
}

 // Retrieve Task by ID
 public function show($id) {
    $work = WorkOrder::find($id);

    if (!$work) {
        return response()->json(['message' => 'Task not found'], 404);
    }

    return response()->json($work, 200);
}


public function update(Request $request, $id) {
    $workOrder = WorkOrder::findOrFail($id);
    $workOrder->update($request->all());

    return response()->json(['message' => 'Work order updated successfully!']);
}


    
public function destroy($id)
{
    $work = WorkOrder::find($id);

    if (!$work) {
        return response()->json(['message' => 'work not found'], 404);
    }

    $work->delete();
    return response()->json(['message' => 'work deleted successfully'], 200);
}
public function deleteWorkDetail($workDetailId)
{
    $workOrder = WorkOrder::whereJsonContains('work_details', [['id' => (int) $workDetailId]])->first();
    if (!$workOrder) {
        return response()->json(['message' => 'Work detail not found'], 404);
    }
    // Filter out the work detail with the given ID
    $updatedWorkDetails = collect($workOrder->work_details)->reject(function ($detail) use ($workDetailId) {
        return $detail['id'] == $workDetailId;
    })->values()->all();
    // Update the work order with the filtered work_details
    $workOrder->update(['work_details' => $updatedWorkDetails]);
    return response()->json(['message' => 'Work detail deleted successfully'], 200);
}


public function BulkStore(Request $request)
{
    $validatedData = $request->validate([
        'work_orders' => 'required|array', // Expecting an array of work orders
        'work_orders.*.job_card_no' => 'required',
        'work_orders.*.plate_number' => 'nullable|string',
        'work_orders.*.customer_name' => 'required|string',
        'work_orders.*.repair_category' => 'nullable|string',
        'work_orders.*.work_details' => 'required|array', // Each work order has multiple work details
        'work_orders.*.work_details.*.workDescription' => 'required|string',
        'work_orders.*.work_details.*.code' => 'nullable|string',
        'work_orders.*.work_details.*.AssignTo' => 'nullable|string',
        'work_orders.*.work_details.*.EstimationTime' => 'nullable|numeric',
        'work_orders.*.work_details.*.totalcost' => 'nullable|numeric',
        'work_orders.*.work_details.*.TimeIn' => 'nullable|date',
        'work_orders.*.work_details.*.TimeOut' => 'nullable|date',
        'work_orders.*.work_details.*.Remark' => 'nullable|string',
        'work_orders.*.work_details.*.status' => 'nullable|string|in:Pending,In Progress,Completed,Started',
        'work_orders.*work_details.*.progress' => 'nullable|integer|min:0|max:100',
    ]);

    $createdWorkOrders = [];

    foreach ($validatedData['work_orders'] as $workOrderData) {
        // Create the work order
        $workOrder = WorkOrder::create([
            'job_card_no' => $workOrderData['job_card_no'],
            'plate_number' => $workOrderData['plate_number'] ?? null,
            'customer_name' => $workOrderData['customer_name'],
            'repair_category' => $workOrderData['repair_category'] ?? null,
        ]);

        // Store work details for this work order
        foreach ($workOrderData['work_details'] as $detail) {
            WorkDetail::create([
                'work_order_id' => $workOrder->id,
                'workDescription' => $detail['workDescription'],
                'code' => $detail['code'] ?? null,
                'AssignTo' => $detail['AssignTo'] ?? null,
                'EstimationTime' => $detail['EstimationTime'] ?? null,
                'totalcost' => $detail['totalcost'] ?? null,
                'TimeIn' => $detail['TimeIn'] ?? null,
                'TimeOut' => $detail['TimeOut'] ?? null,
                'Remark' => $detail['Remark'] ?? null,
                'status' => $detail['status'] ?? 'Pending',
                'progress' => $detail['progress'] ?? null,

            ]);
        }

        $createdWorkOrders[] = $workOrder;
    }

    return response()->json([
        'message' => 'Work orders stored successfully!',
        'work_orders' => $createdWorkOrders
    ], 201);
}
public function getWorkOrdersByJobCard()
    {
        $workOrders = WorkOrder::orderBy('job_card_no', 'asc')->get();
        return response()->json(['data' => $workOrders], 200);
    }

public function showByJobCardNo($job_card_no)
{
    $workOrders = WorkOrder::where('job_card_no', $job_card_no)->get();

    if ($workOrders->isEmpty()) {
        return response()->json(['message' => 'Work orders not found'], 404);
    }

    // Merging all `work_details` from multiple rows into one array
    $mergedWorkDetails = $workOrders->flatMap(fn ($workOrder) => $workOrder->work_details)->all();

    // Returning only one object with all work details merged
    $groupedData = [
        'job_card_no' => $job_card_no,
        'plate_number' => $workOrders->first()->plate_number,
        'customer_name' => $workOrders->first()->customer_name,
        'repair_category' => $workOrders->first()->repair_category,
        'work_details' => $mergedWorkDetails, // ✅ All work details combined
    ];

    return response()->json($groupedData, 200);
}




public function updateWorkDetail(Request $request, $workDetailId)
{
    // Validate incoming request data
    $validatedData = $request->validate([
        'code' => 'nullable|string|in:GS,MC,EL,BD,DS',
        'workDescription' => 'nullable|string',
        'AssignTo' => 'nullable|string',
        'EstimationTime' => 'nullable|string',
        'totalcost' => 'nullable|numeric',
        'TimeIn' => 'nullable|date',
        'TimeOut' => 'nullable|date',
        'Remark' => 'nullable|string',
        'status' => 'nullable|string|in:Pending,In Progress,Completed,Started',
        // 'work_orders.*work_details.*.progress' => 'nullable|integer|min:0|max:100',
        'progress'=>'nullable|integer',

    ]);

    // Find the work order containing the work detail
    $workOrder = WorkOrder::whereJsonContains('work_details', [['id' => (int) $workDetailId]])->first();

    if (!$workOrder) {
        return response()->json(['message' => 'Work detail not found'], 404);
    }

    // Modify the specific work detail in the JSON array
    $updatedWorkDetails = collect($workOrder->work_details)->map(function ($detail) use ($workDetailId, $validatedData) {
        if ($detail['id'] == $workDetailId) {
            return array_merge($detail, $validatedData); // Update the matched work detail
        }
        return $detail;
    })->all();

    // Save the updated work details
    $workOrder->update(['work_details' => $updatedWorkDetails]);

    return response()->json(['message' => 'Work detail updated successfully', 'work_details' => $updatedWorkDetails], 200);
}



public function getAverageProgressByJobCardNo($job_card_no)
{
    $workOrders = WorkOrder::where('job_card_no', $job_card_no)->get();

    if ($workOrders->isEmpty()) {
        return response()->json(['message' => 'Work orders not found'], 404);
    }

    $allWorkDetails = collect($workOrders)->flatMap(fn ($order) => $order->work_details);

    // Extract progress values that are numeric
    $progressValues = $allWorkDetails->pluck('progress')->filter(fn ($val) => is_numeric($val));

    if ($progressValues->isEmpty()) {
        return response()->json(['average_progress' => 0]);
    }

    $average = round($progressValues->avg());

    return response()->json([
        'job_card_no' => $job_card_no,
        'average_progress' => $average,
    ]);
}






public function storeDailyProgress($job_card_no)
{
    $workOrders = WorkOrder::where('job_card_no', $job_card_no)->get();

    if ($workOrders->isEmpty()) {
        return response()->json(['message' => 'Work order not found'], 404);
    }

    $mergedWorkDetails = collect($workOrders)->flatMap(fn ($wo) => $wo->work_details)->all();

    $progressValues = collect($mergedWorkDetails)
        ->pluck('progress')
        ->filter(fn ($value) => is_numeric($value))
        ->map(fn ($val) => (int)$val);

    if ($progressValues->isEmpty()) {
        return response()->json(['message' => 'No progress data found'], 404);
    }

    $averageProgress = round($progressValues->avg());
    $today = Carbon::today()->toDateString();

    // Avoid duplicate record for today
    $existing = DailyProgress::where('job_card_no', $job_card_no)
        ->whereDate('date', $today)
        ->first();

    if (!$existing) {
        DailyProgress::create([
            'job_card_no' => $job_card_no,
            'date' => $today,
            'average_progress' => $averageProgress,
        ]);
    }

    return response()->json([
        'message' => 'Daily progress stored successfully.',
        'data' => [
            'job_card_no' => $job_card_no,
            'date' => $today,
            'average_progress' => $averageProgress
        ]
    ]);
}

// use App\Models\DailyProgress;

public function getDailyProgress()
{
    $data = DailyProgress::all();
    return response()->json($data);
}


}
