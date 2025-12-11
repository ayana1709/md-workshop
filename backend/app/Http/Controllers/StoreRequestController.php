<?php

namespace App\Http\Controllers;

use App\Models\StoreRequest;
use Illuminate\Http\Request;

class StoreRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return StoreRequest::latest()->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'objective_for' => 'required|string|max:255',
            'priority' => 'required|integer|min:1',

            'requested_from' => 'required|string|max:255',
            'requested_by' => 'required|string|max:255',
            'requested_department' => 'required|string|max:255',
            'requested_user' => 'nullable|string|max:255',
            'requested_items' => 'required|array',

            'approved_by' => 'nullable|string|max:255',
            'approved_name' => 'nullable|string|max:255',
            'approved_dept' => 'nullable|string|max:255',
            'approved_status' => 'nullable|in:not_approved,approved,rejected',
            'approved_remark' => 'nullable|string',
            'approved_date' => 'nullable|date',
        ]);

        $validatedData['ref_no'] = $this->generateRefNo();

        $request = StoreRequest::create($validatedData);

        return response()->json($request, 201);
    }

    private function generateRefNo()
    {
        $attempt = 1;

        do {
            // Pad the number to 4 digits with leading zeros
            $refNo = 'REF-'.str_pad($attempt, 4, '0', STR_PAD_LEFT);
            $attempt++;
        } while (StoreRequest::where('ref_no', $refNo)->exists());

        return $refNo;
    }

    /**
     * Display the specified resource.
     */
    public function show(StoreRequest $storeRequest)
    {
        return response()->json($storeRequest);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StoreRequest $storeRequest)
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'objective_for' => 'required|string|max:255',
            'priority' => 'required|integer|min:1',

            'requested_from' => 'required|string|max:255',
            'requested_by' => 'required|string|max:255',
            'requested_department' => 'required|string|max:255',
            'requested_user' => 'nullable|string|max:255',
            'requested_items' => 'required|array',

            'approved_by' => 'nullable|string|max:255',
            'approved_name' => 'nullable|string|max:255',
            'approved_dept' => 'nullable|string|max:255',
            'approved_status' => 'nullable|in:not_approved,approved,rejected',
            'approved_remark' => 'nullable|string',
            'approved_date' => 'nullable|date',
        ]);

        $storeRequest->update($validatedData);

        return response()->json($storeRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StoreRequest $storeRequest)
    {
        $storeRequest->delete();

        return response()->json(null, 204);
    }
}
