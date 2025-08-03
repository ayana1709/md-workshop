<?php

namespace App\Http\Controllers;

use App\Models\DailyProgress;
use Illuminate\Http\Request;
use App\Models\PostDriveTest;
use App\Models\JobDeliveryStatus;


class PostDriveTestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'job_card_no' => 'required|string',
            'customer_name' => 'required|string',
            'plate_number' => 'required|string',
            'checked_by' => 'required|string',
            'checked_date' => 'required|date',
            'post_test_observation' => 'nullable|string',
            'recommendation' => 'nullable|string',
            'technician_final_approval' => 'required|in:Pass,Fail,Pending',
        ]);

        $postDriveTest = PostDriveTest::create($request->all());

        return response()->json(['message' => 'Post-Drive Test saved successfully', 'data' => $postDriveTest], 201);
    }


    public function show($id) {
        $test = PostDriveTest::find($id);
        if (!$test) {
            return response()->json(['message' => 'Test not found'], 404);
        }
        return response()->json($test, 200);
    }


    //
    public function getByJobCardNo($job_card_no)
{
    $test = PostDriveTest::where('job_card_no', $job_card_no)->first();

    if (!$test) {
        return response()->json(['message' => 'Test drive result not found.'], 404);
    }

    return response()->json($test, 200);
}
//
    public function index()
    {
        return response()->json(PostDriveTest::all());
    }




public function batchFetch(Request $request)
{
    $jobIds = $request->input('job_ids', []);
    $unpaddedIds = array_map(fn($id) => ltrim($id, '0'), $jobIds);

    $tests = PostDriveTest::whereIn('job_card_no', $unpaddedIds)
        ->get()
        ->keyBy(function ($item) {
            return str_pad($item->job_card_no, 4, '0', STR_PAD_LEFT);
        });

    return response()->json($tests);
}


public function updateDeliveryStatus(Request $request, $jobId)
{
    try {
        $jobId = ltrim($jobId, '0');

        // Get latest progress to ensure test drive is Pass
        $progress = DailyProgress::where('job_card_no', $jobId)
            ->orderBy('date', 'desc')
            ->first();

        // if (!$progress || strtolower($progress->test_drive) !== 'pass') {
        //     return response()->json(['message' => 'Cannot update. Test drive not passed.'], 403);
        // }

        // Find or create delivery status record
        $status = JobDeliveryStatus::updateOrCreate(
            ['job_id' => $jobId],
            [
                'driver_status' => $request->driverStatus,
                'checked_by' => $request->checkedBy,
                'approved_by' => $request->approvedBy,
                'received_date' => $request->receivedDate,
            ]
        );

        return response()->json(['message' => 'Delivery status updated', 'data' => $status]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Server error',
            'error' => $e->getMessage()
        ], 500);
    }
}
public function batchByJobIds(Request $request)
{
    $jobIds = $request->input('job_ids', []);
    $records = JobDeliveryStatus::whereIn('job_id', $jobIds)->get();

    return response()->json(
    $records->mapWithKeys(function ($item) {
        $paddedJobId = str_pad($item->job_id, 4, '0', STR_PAD_LEFT); // "1" → "0001"
        return [
            $paddedJobId => [
                'driver_status' => $item->driver_status,
                'checked_by' => $item->checked_by,
                'approved_by' => $item->approved_by,
                'received_date' => $item->received_date,
            ],
        ];
    })
);

}





}

