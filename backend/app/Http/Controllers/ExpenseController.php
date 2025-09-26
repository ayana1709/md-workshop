<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    // List all expenses
    public function index()
    {
        return response()->json(Expense::latest()->get());
    }

    // Store new expense
    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'category' => 'required|string',
            'amount' => 'required|numeric',
            'payment_method' => 'nullable|string',
            'reference_no' => 'nullable|string',
            'paid_by' => 'nullable|string',
            'approved_by' => 'nullable|string',
            'remarks' => 'nullable|string',
            'staff_name' => 'nullable|string',
            'hours' => 'nullable|integer',
            'rate' => 'nullable|numeric',
            'service_provider' => 'nullable|string',
            'service_type' => 'nullable|string',
            'job_id' => 'nullable|integer',
            'utility_type' => 'nullable|string',
            'billing_period' => 'nullable|string',
            'account_no' => 'nullable|string',
            'vendor_name' => 'nullable|string',
            'contract_no' => 'nullable|string',
            'beneficiary' => 'nullable|string',
        ]);

        $expense = Expense::create($data);
        return response()->json($expense, 201);
    }

    // View single expense by ID
    public function show($id)
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }
        return response()->json($expense);
    }

    // Update expense by ID
    public function update(Request $request, $id)
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $expense->update($request->all());
        return response()->json(['message' => 'Expense updated successfully', 'expense' => $expense]);
    }

    // Delete expense by ID
    public function destroy($id)
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $expense->delete();
        return response()->json(['message' => 'Expense deleted successfully']);
    }

    // Update expense(s) by job_id
    public function updateByJobId(Request $request, $jobId)
    {
        $expenses = Expense::where('job_id', $jobId)->get();
        if ($expenses->isEmpty()) {
            return response()->json(['message' => 'No expenses found for this job ID'], 404);
        }

        foreach ($expenses as $expense) {
            $expense->update($request->all());
        }

        return response()->json(['message' => 'Expenses updated successfully']);
    }

    // Delete expense(s) by job_id
    public function deleteByJobId($jobId)
    {
        $deleted = Expense::where('job_id', $jobId)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'No expenses found for this job ID'], 404);
        }
        return response()->json(['message' => 'Expenses deleted successfully']);
    }

    // Bulk delete expenses
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids');
        if (!is_array($ids) || empty($ids)) {
            return response()->json(['message' => 'Invalid or empty ids array'], 400);
        }

        Expense::whereIn('id', $ids)->delete();
        return response()->json(['message' => 'Selected expenses deleted successfully']);
    }
}
