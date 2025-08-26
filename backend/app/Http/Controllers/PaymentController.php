<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\RepairRegistration;

class PaymentController extends Controller
{
    // Store new payment
    public function store(Request $request)
    {
        // Base validation rules
        $rules = [
            'repair_registration_id' => 'required|exists:repair_registrations,id',
            'job_id' => 'required|string|exists:repair_registrations,job_id',
            'customer_name' => 'required|string',
            // 'plate_number' => 'required|string',
            'payment_method' => 'required|in:Cash,Transfer,Credit,Cheque',
            'payment_status' => 'required|in:Full Payment,Advance,Credit,Remaining',
            'paid_amount' => 'required|numeric|min:0',
            'remaining_amount' => 'nullable|numeric|min:0',
            'ref_no' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'paid_by' => 'nullable|string',
            'approved_by' => 'nullable|string',
            'reason' => 'nullable|string',
            'remark' => 'nullable|string',
            'from_bank' => 'nullable|string',
            'to_bank' => 'nullable|string',
        ];

        // Add required bank fields only if payment method is Transfer
       if ($request->payment_method === 'Transfer') {
        $rules['from_bank'] = 'required|string';
        $rules['to_bank'] = 'required|string';
    }

    $validated = $request->validate($rules);

    // ✅ Check job_id and repair_registration match
    $repair = RepairRegistration::find($validated['repair_registration_id']);
    if ($repair->job_id !== $validated['job_id']) {
        return response()->json([
            'message' => 'Mismatch between job_id and repair_registration_id.'
        ], 422);
    }

    // ✅ Check if a payment already exists for this job_id
    $existingPayment = Payment::where('job_id', $validated['job_id'])->first();
    if ($existingPayment) {
        return response()->json([
            'message' => '❌ A payment already exists for this Job ID.'
        ], 409); // 409 = Conflict
    }

    // ✅ Create payment
    $payment = Payment::create($validated);

    return response()->json([
        'message' => '✅ Payment recorded successfully.',
        'payment' => $payment,
    ], 201);
}
 
public function quickStore(Request $request)
{
    $rules = [
        'customer_name' => 'required|string',
        'plate_number' => 'required|string',
        'payment_method' => 'required|in:Cash,Transfer,Credit,Cheque',
        'payment_status' => 'required|in:Full Payment,Advance,Credit,Remaining',
        'paid_amount' => 'required|numeric|min:0',
        'remaining_amount' => 'nullable|numeric|min:0',
        'ref_no' => 'nullable|string',
        'payment_date' => 'nullable|date',
        'paid_by' => 'nullable|string',
        'approved_by' => 'nullable|string',
        'reason' => 'nullable|string',
        'remark' => 'nullable|string',
        'from_bank' => 'nullable|string',
        'to_bank' => 'nullable|string',
        'job_id' => 'nullable|string',
        'repair_registration_id' => 'nullable|integer',
    ];

    // Validate bank fields if payment method is Transfer
    if ($request->payment_method === 'Transfer') {
        $rules['from_bank'] = 'required|string';
        $rules['to_bank'] = 'required|string';
    }

    $validated = $request->validate($rules);

    // Just store without checking for existing payment or job_id match
    $payment = Payment::create($validated);

    return response()->json([
        'message' => '✅ Payment saved successfully (quick entry).',
        'payment' => $payment,
    ], 201);
}




    // PaymentController.php
// public function getByJobId($jobId)
// {
//     $payment = Payment::get()->first(function ($item) use ($jobId) {
//         return ltrim($item->job_id, '0') == ltrim($jobId, '0');
//     });

//     if (!$payment) {
//         return response()->json(['error' => 'Not found'], 404);
//     }

//     return response()->json($payment);
// }

public function getByJobId($job_id)
{
    $payment = Payment::where('job_id', $job_id)->first();

    if (!$payment) {
        return response()->json(['message' => 'Payment not found'], 404);
    }

    return response()->json($payment);
}


    public function index()
{
    $payments = Payment::latest()->get(); // or paginate(20) if needed

    return response()->json($payments);
}

public function show($id)
{
    // Try by primary ID first
    $payment = Payment::find($id);

    // If not found and ID is not numeric, try by job_id
    if (!$payment && !is_numeric($id)) {
        $payment = Payment::where('job_id', $id)->first();
    }

    if (!$payment) {
        return response()->json(['message' => 'Payment not found'], 404);
    }

    return response()->json($payment);
}



    // Update payment





    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validated = $request->validate([
            'job_id'           => 'required|integer',
            'customer_name'    => 'required|string',
            'plate_number'     => 'required|string',
            'payment_method'   => 'required|string',
            'payment_status'   => 'required|string',
            'paid_amount'      => 'required|numeric',
            'remaining_amount' => 'required|numeric',
            'ref_no'           => 'nullable|string',
            'payment_date'     => 'required|date',
            'paid_by'          => 'nullable|string',
            'approved_by'      => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json(['message' => 'Payment updated successfully', 'payment' => $payment]);
    }



public function updateByJobId(Request $request, $job_id)
{
    $payment = Payment::where('job_id', $job_id)->first();

    if (!$payment) {
        return response()->json(['message' => 'Payment not found'], 404);
    }

    $validated = $request->validate([
        'payment_method'   => 'required|string',
        'payment_status'   => 'required|string',
        'paid_amount'      => 'required|numeric',
        'remaining_amount' => 'required|numeric',
        'payment_date'     => 'required|date',
        'paid_by'          => 'nullable|string',
        'approved_by'      => 'nullable|string',
        'reason'           => 'nullable|string',
        'remark'           => 'nullable|string',
    ]);

    $payment->update($validated);

    return response()->json(['message' => 'Payment updated successfully', 'payment' => $payment]);
}










 public function destroyByJobId($job_id)
{
    $payment = Payment::where('job_id', $job_id)->first();

    if (!$payment) {
        return response()->json(['message' => 'Payment not found'], 404);
    }

    $payment->delete();

    return response()->json(['message' => 'Payment deleted successfully']);
}



    


}
