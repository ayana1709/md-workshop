<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Salee;
use App\Models\SaleReceipt;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleeController extends Controller
{
    /**
     * List all sales with all relations
     */
    public function index()
    {
        $sales = Salee::with([
            'item',
            'branch',
            'receipt',
            'payments',
            'customer',
            'creator'
        ])->get();

        return response()->json($sales);
    }

    /**
     * Store a new sale
     */
   public function store(Request $request)
{
    $validated = $request->validate([
        'item_code'     => 'required|exists:items,item_code',
        'quantity'      => 'required|integer|min:1',
        'actual_unit_price' => 'required|numeric|min:0',
        'sale_type'     => 'required|in:with_receipt,without_receipt',
        'branch_id'     => 'required|exists:branches,id',

        // customer info always optional
        'customer_id'   => 'nullable|exists:customers,id',
        'customer_name' => 'nullable|string',
        'customer_phone'=> 'nullable|string',
        'customer_address'=> 'nullable|string',

        // payment info
        'payments'      => 'nullable|array',
        'payments.*.amount' => 'required_with:payments|numeric|min:0',
        'payments.*.payment_method' => 'required_with:payments|string',
        'payments.*.payment_reference' => 'nullable|string',
    ]);

    $item = Item::where('item_code', $validated['item_code'])->first();

    if ($item->initial_stock < $validated['quantity']) {
        return response()->json(['message' => 'Not enough stock'], 400);
    }

    DB::beginTransaction();

    try {
        // Create customer if not selected
        $customerId = $validated['customer_id'] ?? null;
        if (!$customerId && isset($validated['customer_name'])) {
            $customer = Customer::create([
                'full_name' => $validated['customer_name'],
                'phone'     => $validated['customer_phone'] ?? null,
                'address'   => $validated['customer_address'] ?? null,
            ]);
            $customerId = $customer->id;
        }

        // Create Sale
        $sale = Salee::create([
            'item_code' => $item->item_code,
            'quantity' => $validated['quantity'],
            'actual_unit_price' => $validated['actual_unit_price'],
            'actual_total_price' => $validated['quantity'] * $validated['actual_unit_price'],
            'sale_type' => in_array($validated['sale_type'], ['with_receipt','without_receipt']) ? $validated['sale_type'] : 'cash',
            'branch_id' => $validated['branch_id'],
            'created_by' => auth()->id() ?? 1,
            'customer_id' => $customerId,
        ]);

        // Decrease stock
        $item->decrement('initial_stock', $validated['quantity']);

        // Sale Receipt only if with_receipt
        if ($validated['sale_type'] === 'with_receipt') {
            $receiptTotal = $validated['quantity'] * $validated['actual_unit_price'];
            $vatCollected = round($receiptTotal * 0.15, 2);

            $sale->receipt()->create([
                'receipt_unit_price'  => $validated['actual_unit_price'],
                'receipt_total_price' => $receiptTotal,
                'vat_collected'       => $vatCollected,
                'receipt_date'        => now(),
                'branch_id'           => $validated['branch_id'],
                'created_by'          => auth()->id() ?? 1,
                // customer info for receipt is optional
                'customer_name'       => $validated['customer_name'] ?? null,
                'customer_phone'      => $validated['customer_phone'] ?? null,
                'customer_address'    => $validated['customer_address'] ?? null,
            ]);
        }

        // Payments
        if (isset($validated['payments'])) {
            foreach ($validated['payments'] as $p) {
                $sale->payments()->create([
                    'amount' => $p['amount'],
                    'payment_method' => $p['payment_method'],
                    'payment_reference' => $p['payment_reference'] ?? null,
                    'paid_at' => now(),
                ]);
            }
        }

        DB::commit();

        return response()->json([
            'message' => 'Sale completed successfully',
            'sale' => $sale->load('receipt','payments','item','customer','branch','creator'),
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to record sale',
            'error' => $e->getMessage(),
        ], 500);
    }
}


    /**
     * Show a single sale by ID
     */
    public function show($id)
    {
        $sale = Salee::with([
            'item',
            'branch',
            'receipt',
            'payments',
            'customer',
            'creator'
        ])->find($id);

        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        return response()->json($sale);
    }

    /**
     * Update a sale (only quantity and price for simplicity)
     */
    public function update(Request $request, $id)
    {
        $sale = Salee::find($id);
        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        $validated = $request->validate([
            'quantity' => 'nullable|integer|min:1',
            'actual_unit_price' => 'nullable|numeric|min:0',
        ]);

        if (isset($validated['quantity'])) {
            $sale->quantity = $validated['quantity'];
        }
        if (isset($validated['actual_unit_price'])) {
            $sale->actual_unit_price = $validated['actual_unit_price'];
        }

        $sale->actual_total_price = $sale->quantity * $sale->actual_unit_price;
        $sale->save();

        return response()->json($sale->load('item','receipt','payments','customer','branch','creator'));
    }

    /**
     * Delete a sale
     */
    public function destroy($id)
    {
        $sale = Salee::find($id);
        if (!$sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        $sale->delete();

        return response()->json(['message' => 'Sale deleted successfully']);
    }
}
