<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;

class PaymentController extends Controller
{
    // Store new payment
  public function store(Request $request)
{
    $validated = $request->validate([
        'jobId'          => 'required|string|unique:payments,jobId',
        'name'           => 'nullable|string',
        'mobile'         => 'nullable|string',
        'plate'          => 'nullable|string',
        'model'          => 'nullable|string',
        'priority'       => 'nullable|string',
        'receivedDate'   => 'nullable|date',
        'dateOut'        => 'nullable|date',
        'method'         => 'nullable|in:cash,transfer,card',
        'status'         => 'nullable|string',
        'paidAmount'     => 'nullable|numeric|min:0',
        'remainingAmount'=> 'nullable|numeric|min:0',
        'reference'      => 'nullable|string',
        'date'           => 'nullable|date',
        'paidBy'         => 'nullable|string',
        'approvedBy'     => 'nullable|string',
        'reason'         => 'nullable|string',
        'remarks'        => 'nullable|string',
        'labourCosts'    => 'nullable|array',
        'labourCosts.*.description' => 'nullable|string',
        'labourCosts.*.time'        => 'nullable|string',
        'labourCosts.*.total'       => 'nullable|numeric',
        'spareCosts'     => 'nullable|array',
        'spareCosts.*.itemName'     => 'nullable|string',
        'spareCosts.*.partNumber'   => 'nullable|string',
        'spareCosts.*.qty'          => 'nullable|numeric',
        'spareCosts.*.unitPrice'    => 'nullable|numeric',
        'spareCosts.*.total'        => 'nullable|numeric',
        'otherCosts'     => 'nullable|array',
        'otherCosts.*.description'  => 'nullable|string',
        'otherCosts.*.amount'       => 'nullable|numeric',
        'summary'        => 'nullable|array',
    ]);

    $payment = Payment::create($validated);

    return response()->json([
        'message' => '✅ Payment saved successfully.',
        'payment' => $payment,
    ], 201);
}


    // Get payment by jobId
    public function getByJobId($jobId)
    {
        $payment = Payment::where('jobId', $jobId)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json($payment);
    }

    // Update payment by jobId
    public function updateByJobId(Request $request, $jobId)
    {
        $payment = Payment::where('jobId', $jobId)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validated = $request->validate([
            'name'           => 'nullable|string',
            'mobile'         => 'nullable|string',
            'plate'          => 'nullable|string',
            'model'          => 'nullable|string',
            'priority'       => 'nullable|string',
            'receivedDate'   => 'nullable|date',
            'dateOut'        => 'nullable|date',
            'method'         => 'nullable|in:cash,transfer,card',
            // 'status'         => 'required|in:full,partial',
            'paidAmount'     => 'nullable|numeric|min:0',
            'remainingAmount'=> 'nullable|numeric|min:0',
            'reference'      => 'nullable|string',
            'date'           => 'nullable|date',
            'paidBy'         => 'nullable|string',
            'approvedBy'     => 'nullable|string',
            'reason'         => 'nullable|string',
            'remarks'        => 'nullable|string',
            'labourCosts'    => 'nullable|array',
            'spareCosts'     => 'nullable|array',
            'otherCosts'     => 'nullable|array',
            'summary'        => 'nullable|array',
        ]);

        $payment->update($validated);

        return response()->json([
            'message' => '✅ Payment updated successfully.',
            'payment' => $payment,
        ]);
    }

    // List all payments
    public function index()
    {
        $payments = Payment::latest()->get();
        return response()->json($payments);
    }

    // Delete payment by jobId
    public function destroyByJobId($jobId)
    {
        $payment = Payment::where('jobId', $jobId)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->delete();

        return response()->json(['message' => '✅ Payment deleted successfully.']);
    }
}
