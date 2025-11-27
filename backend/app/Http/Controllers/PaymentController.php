<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    // 🟢 Store new payment
public function store(Request $request)
{
    $validated = $request->validate([
        'date'             => 'nullable|date',
        'name'             => 'nullable|string',
        'reference'        => 'nullable|string',
        'fs'               => 'nullable|string',
        'mobile'           => 'nullable|string',
        'tin'              => 'nullable|string',
        'vat'              => 'nullable|string',
        'method'           => 'nullable|in:cash,transfer,card,cheque',
        'status'           => 'nullable|string',
        'paidAmount'       => 'nullable|numeric|min:0',
        'remainingAmount'  => 'nullable|numeric|min:0',
        'paidBy'           => 'nullable|string',
        'approvedBy'       => 'nullable|string',
        'reason'           => 'nullable|string',
        'remarks'          => 'nullable|string',
        'fromBank'         => 'nullable|string',
        'toBank'           => 'nullable|string',
        'otherFromBank'    => 'nullable|string',
        'otherToBank'      => 'nullable|string',
        'chequeNumber'     => 'nullable|string',
        'image'            => 'nullable|image|mimes:jpg,jpeg,png,pdf|max:2048',
        // no 'array' validation for these
        'labourCosts'      => 'nullable',
        'spareCosts'       => 'nullable',
        'otherCosts'       => 'nullable',
        'summary'          => 'nullable',
    ]);

    // 🔹 Decode JSON fields
    if ($request->has('labourCosts')) {
        $validated['labourCosts'] = json_decode($request->labourCosts, true);
    }
    if ($request->has('spareCosts')) {
        $validated['spareCosts'] = json_decode($request->spareCosts, true);
    }
    if ($request->has('otherCosts')) {
        $validated['otherCosts'] = json_decode($request->otherCosts, true);
    }
    if ($request->has('summary')) {
        $validated['summary'] = json_decode($request->summary, true);
    }

    // 🔹 Handle file upload
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('payment_images', 'public');
        $validated['image'] = $path;
    }

    $payment = Payment::create($validated);

    return response()->json([
        'message' => '✅ Payment saved successfully.',
        'payment' => $payment,
    ], 201);
}


    // 🟣 Update existing payment
  public function update(Request $request, $id)
{
    $payment = Payment::find($id);
    if (!$payment) {
        return response()->json(['message' => 'Payment not found'], 404);
    }

    $validated = $request->validate([
        'date'             => 'nullable|date',
        'name'             => 'nullable|string',
        'reference'        => 'nullable|string',
        'fs'               => 'nullable|string',
        'mobile'           => 'nullable|string',
        'tin'              => 'nullable|string',
        'vat'              => 'nullable|string',
        'method'           => 'nullable|in:cash,transfer,card,cheque',
        'status'           => 'nullable|string',
        'paidAmount'       => 'nullable|numeric|min:0',
        'remainingAmount'  => 'nullable|numeric|min:0',
        'paidBy'           => 'nullable|string',
        'approvedBy'       => 'nullable|string',
        'reason'           => 'nullable|string',
        'remarks'          => 'nullable|string',
        'fromBank'         => 'nullable|string',
        'toBank'           => 'nullable|string',
        'otherFromBank'    => 'nullable|string',
        'otherToBank'      => 'nullable|string',
        'chequeNumber'     => 'nullable|string',
        'image'            => 'nullable|image|mimes:jpg,jpeg,png,pdf|max:2048',
        'labourCosts'      => 'nullable|array',
        'spareCosts'       => 'nullable|array',
        'otherCosts'       => 'nullable|array',
        'summary'          => 'nullable|array',
    ]);

    // 🔹 Handle image replacement if uploaded
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('payment_images', 'public');
        $validated['image'] = $path;
    }

    $payment->update($validated);

    return response()->json([
        'message' => '✅ Payment updated successfully.',
        'payment' => $payment->fresh(),
    ]);
}


    // 🟡 Other existing methods stay unchanged
    public function index()
    {
        $payments = Payment::latest()->get();
        return response()->json($payments);
    }

    public function show($id)
    {
        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }
        return response()->json($payment);
    }

    public function destroy($id)
    {
        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        // Delete image if exists
        if ($payment->image && Storage::disk('public')->exists($payment->image)) {
            Storage::disk('public')->delete($payment->image);
        }

        $payment->delete();

        return response()->json(['message' => '✅ Payment deleted successfully.']);
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:payments,id',
        ]);

        $deleted = Payment::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "✅ {$deleted} payment(s) deleted successfully.",
            'deleted_count' => $deleted,
        ]);
    }

    public function generateRefNum()
    {
        $lastPayment = Payment::orderBy('id', 'desc')->first();
        $nextRef = $lastPayment && $lastPayment->reference
            ? 'REF-' . str_pad(intval(substr($lastPayment->reference, 4)) + 1, 4, '0', STR_PAD_LEFT)
            : 'REF-0001';
        return response()->json(['refNum' => $nextRef]);
    }

    public function deleteItem(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:spareCosts,labourCosts,otherCosts',
            'index' => 'required|integer|min:0',
        ]);

        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $array = $payment->{$validated['type']} ?? [];
        if (!isset($array[$validated['index']])) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        array_splice($array, $validated['index'], 1);
        $payment->update([$validated['type'] => $array]);

        return response()->json([
            'message' => '✅ Item deleted successfully.',
            'updated_' . $validated['type'] => $array,
        ]);
    }
}
