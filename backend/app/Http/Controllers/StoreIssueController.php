<?php

namespace App\Http\Controllers;

use App\Models\StoreIssue;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoreIssueController extends Controller
{
    public function index()
    {
        return StoreIssue::latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'ref_no' => 'required|string|unique:store_issues,ref_no',
            'objective_for' => 'required|string|max:255',
            'priority' => 'required|integer',

            'store_items' => 'required|array',
            'subtotal' => 'required|numeric|min:0',
            'total_vat' => 'required|numeric|min:0',
            'total_price_including_vat' => 'required|numeric|min:0',
            'amount_in_words' => 'required|string',

            'requested_from' => 'required|string|max:255',
            'store_branch' => 'required|string|max:255',
            'requested_by' => 'required|string|max:255',
            'requested_department' => 'required|string|max:255',
            'requested_user' => 'nullable|string|max:255',
            'requested_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'request_remark' => 'nullable|string',

            'delivered_by' => 'nullable|string|max:255',
            'delivered_dept' => 'nullable|string|max:255',
            'delivered_status' => ['required', Rule::in(['not_delivered', 'delivered'])],
            'delivered_remark' => 'nullable|string',

            'issued_to' => 'nullable|string|max:255',
            'issued_department' => 'nullable|string|max:255',
            'issued_status' => ['required', Rule::in(['not_issued', 'issued'])],
            'issued_remark' => 'nullable|string',

            'approved_by' => 'nullable|string|max:255',
            'approved_name' => 'nullable|string|max:255',
            'approved_dept' => 'nullable|string|max:255',
            'approved_status' => ['required', Rule::in(['not_approved', 'approved', 'rejected'])],
            'approved_remark' => 'nullable|string',
        ]);

        $issue = StoreIssue::create($validatedData);

        return response()->json($issue, 201);
    }

    public function show(StoreIssue $storeIssue)
    {
        return response()->json($storeIssue);
    }

    public function update(Request $request, StoreIssue $storeIssue)
    {
        $validatedData = $request->validate([
            'date' => 'sometimes|required|date',
            'ref_no' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('store_issues', 'ref_no')->ignore($storeIssue->id),
            ],
            'objective_for' => 'sometimes|required|string|max:255',
            'priority' => 'sometimes|required|integer',

            'store_items' => 'sometimes|required|array',
            'subtotal' => 'sometimes|required|numeric|min:0',
            'total_vat' => 'sometimes|required|numeric|min:0',
            'total_price_including_vat' => 'sometimes|required|numeric|min:0',
            'amount_in_words' => 'sometimes|required|string',

            'requested_from' => 'sometimes|required|string|max:255',
            'store_branch' => 'sometimes|required|string|max:255',
            'requested_by' => 'sometimes|required|string|max:255',
            'requested_department' => 'sometimes|required|string|max:255',
            'requested_user' => 'sometimes|nullable|string|max:255',
            'requested_status' => ['sometimes', 'required', Rule::in(['pending', 'approved', 'rejected'])],
            'request_remark' => 'sometimes|nullable|string',

            'delivered_by' => 'sometimes|nullable|string|max:255',
            'delivered_dept' => 'sometimes|nullable|string|max:255',
            'delivered_status' => ['sometimes', 'required', Rule::in(['not_delivered', 'delivered'])],
            'delivered_remark' => 'sometimes|nullable|string',

            'issued_to' => 'sometimes|nullable|string|max:255',
            'issued_department' => 'sometimes|nullable|string|max:255',
            'issued_status' => ['sometimes', 'required', Rule::in(['not_issued', 'issued'])],
            'issued_remark' => 'sometimes|nullable|string',

            'approved_by' => 'sometimes|nullable|string|max:255',
            'approved_name' => 'sometimes|nullable|string|max:255',
            'approved_dept' => 'sometimes|nullable|string|max:255',
            'approved_status' => ['sometimes', 'required', Rule::in(['not_approved', 'approved', 'rejected'])],
            'approved_remark' => 'sometimes|nullable|string',
        ]);

        $storeIssue->update($validatedData);

        return response()->json($storeIssue, 200);
    }

    public function destroy(StoreIssue $storeIssue)
    {
        $storeIssue->delete();

        return response()->json(null, 204);
    }
}