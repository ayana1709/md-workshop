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
        'job_id'       => 'required|exists:repair_registrations,job_id',
        'tasks'        => 'required|array',
        'spares'       => 'nullable|array',
        'other_cost'   => 'nullable|numeric',
        'vat_applied'  => 'boolean',
        'vat_amount'   => 'nullable|numeric',
        'total_cost'   => 'nullable|numeric',
        'progress'     => 'required|numeric|min:0|max:100',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors'  => $validator->errors()
        ], 422);
    }

    $jobId = str_pad($request->job_id, 4, '0', STR_PAD_LEFT);

    $repairDetail = RepairDetail::create([
        'job_id'      => $jobId,
        'tasks'       => $request->tasks,
        'spares'      => $request->spares,
        'other_cost'  => $request->other_cost ?? "",
        'vat_applied' => $request->vat_applied ?? false,
        'vat_amount'  => $request->vat_amount ?? "",
        'total_cost'  => $request->total_cost ?? "",
        'progress'    => $request->progress,
    ]);

    return response()->json([
        'message' => 'Repair detail created successfully',
        'data'    => $repairDetail
    ], 201);
}

public function update(Request $request, $jobId)
{
    $jobId = str_pad($jobId, 4, '0', STR_PAD_LEFT);

    $validator = Validator::make($request->all(), [
        'tasks'        => 'nullable|array',   // allow empty tasks
        'spares'       => 'nullable|array',
        'other_cost'   => 'nullable|numeric',
        'vat_applied'  => 'nullable|boolean',
        'vat_amount'   => 'nullable|numeric',
        'total_cost'   => 'nullable|numeric',
        'status'       => 'nullable|string',
        'labour_status'=> 'nullable|string',
        'progress'     => 'nullable|numeric|min:0|max:100',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors'  => $validator->errors()
        ], 422);
    }

    $repairDetail = RepairDetail::updateOrCreate(
        ['job_id' => $jobId],
        [
            'tasks'        => $request->tasks ?? [],
            'spares'       => $request->spares ?? [],
            'other_cost'   => $request->other_cost ?? "",
            'vat_applied'  => $request->vat_applied ?? false,
            'vat_amount'   => $request->vat_amount ?? "",
            'total_cost'   => $request->total_cost ?? "",
            'status'       => $request->status ?? null,
            // 'labour_status'=> $request->labour_status ?? null,
            'progress'     => $request->progress ?? 0,
        ]
    );

    return response()->json([
        'message' => $repairDetail->wasRecentlyCreated
            ? 'Repair detail created successfully'
            : 'Repair detail updated successfully',
        'data'    => $repairDetail
    ]);
}



    /**
     * Update existing repair detail
     */



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
