<?php

namespace App\Http\Controllers;

use App\Models\RepairDetail;
use App\Models\RepairRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RepairDetailController extends Controller
{
    /**
     * Show repair detail by job_id
     */
    public function show($jobId)
    {
        $jobId = str_pad($jobId, 4, '0', STR_PAD_LEFT);

        $repair = RepairDetail::where('job_id', $jobId)->first();

        if (!$repair) {
            return response()->json([
                'message' => 'Repair detail not found for this job_id'
            ], 404);
        }

        return response()->json($repair);
    }

    /**
     * Store new repair detail
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jobId'         => 'required|exists:repair_registrations,job_id',
            'tasks'         => 'required|array',
            'spares'        => 'nullable|array',
            'other_cost'     => 'nullable|numeric',
            'totalCost'     => 'nullable|numeric',
            // 'labourStatus'  => 'required|string',
            'status'        => 'required|string',
            'progress'      => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $jobId = str_pad($request->jobId, 4, '0', STR_PAD_LEFT);

        $repairDetail = RepairDetail::create([
            'job_id'        => $jobId,
            'tasks'         => $request->tasks,
            'spares'        => $request->spares,
            'other_cost'    => $request->other_cost ?? 0,
            'total_cost'    => $request->totalCost ?? 0,
            // 'labour_status' => $request->labourStatus,
            'status'        => $request->status,
            'progress'      => $request->progress,
        ]);

        return response()->json([
            'message' => 'Repair detail created successfully',
            'data' => $repairDetail
        ], 201);
    }

    /**
     * Update existing repair detail
     */
    public function update(Request $request, $jobId)
    {
        $jobId = str_pad($jobId, 4, '0', STR_PAD_LEFT);

        $repairDetail = RepairDetail::where('job_id', $jobId)->first();

        if (!$repairDetail) {
            return response()->json([
                'message' => 'Repair detail not found for this job_id'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tasks'         => 'required|array',
            'spares'        => 'nullable|array',
            'other_cost'     => 'nullable|numeric',
            'totalCost'     => 'nullable|numeric',
            // 'labourStatus'  => 'required|string',
            'status'        => 'required|string',
            'progress'      => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $repairDetail->update([
            'tasks'         => $request->tasks,
            'spares'        => $request->spares,
            'other_cost'    => $request->other_cost ?? $repairDetail->other_cost,
            'total_cost'    => $request->totalCost ?? $repairDetail->total_cost,
            // 'labour_status' => $request->labourStatus,
            'status'        => $request->status,
            'progress'      => $request->progress,
        ]);

        return response()->json([
            'message' => 'Repair detail updated successfully',
            'data' => $repairDetail
        ]);
    }

    /**
     * Delete repair detail by job_id
     */
    public function destroy($jobId)
    {
        $jobId = str_pad($jobId, 4, '0', STR_PAD_LEFT);

        $repairDetail = RepairDetail::where('job_id', $jobId)->first();

        if (!$repairDetail) {
            return response()->json([
                'message' => 'Repair detail not found for this job_id'
            ], 404);
        }

        $repairDetail->delete();

        return response()->json([
            'message' => 'Repair detail deleted successfully'
        ]);
    }
}
