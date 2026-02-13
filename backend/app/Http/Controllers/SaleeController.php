<?php

namespace App\Http\Controllers;

use App\Models\Salee;
use App\Models\SaleItem;
use App\Models\Item;
use App\Models\Customer;
use App\Models\SaleReceipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleeController extends Controller
{
    // GET /salee
    public function index()
    {
        $sales = Salee::with(['items', 'customer', 'branch', 'creator', 'receipt'])->get();
        return response()->json($sales);
    }
// GET /salee/with-receipt
public function withReceiptSales()
{
    // Get only sales with type 'with_receipt'
    $sales = Salee::with([
        'items',       // Sale items
        'customer',    // Customer info
        'branch',      // Branch info
        'creator',     // Admin/creator info
        'receipt'      // Receipt info
    ])
    ->where('sale_type', 'with_receipt')
    ->get();

    return response()->json($sales);
}


    // GET /salee/{id}
    public function show(Salee $sale)
    {
        return response()->json($sale->load(['items', 'customer', 'branch', 'creator']));
    }

    // POST /salee
public function store(Request $request)
{
    // --------------------------
    // Parse items JSON if it's a string (from FormData)
    // --------------------------
    if (is_string($request->items)) {
        $request->merge([
            'items' => json_decode($request->items, true)
        ]);
    }

    $validated = $request->validate([
        'sale_type' => 'required|in:with_receipt,without_receipt',
        'branch_id' => 'required|exists:branches,id',
        'customer_id'   => 'nullable|exists:customers,id',
        'customer_name' => 'nullable|string',
        'customer_phone'=> 'nullable|string',
        'customer_address'=> 'nullable|string',
        'items' => 'required|array|min:1',
        'items.*.item_code' => 'required|exists:items,item_code',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.unit_price' => 'required|numeric|min:0',
        'items.*.vat_percent' => 'nullable|numeric|min:0|max:100',

        // Optional receipt overrides
        'receipt_unit_price' => 'nullable|numeric|min:0',
        'receipt_total_price' => 'nullable|numeric|min:0',
        'vat_collected' => 'nullable|numeric|min:0',
        'payment_type' => 'nullable|in:cash,credit,card',
        'paid_amount' => 'nullable|numeric|min:0',

        // Receipt images
        'receipt_images.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240', // max 10MB
    ]);

    DB::beginTransaction();

    try {
        // --------------------------
        // CUSTOMER CREATION
        // --------------------------
        $customerId = $validated['customer_id'] ?? null;
        if (!$customerId && !empty($validated['customer_name'])) {
            $customer = Customer::create([
                'full_name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'] ?? null,
                'address' => $validated['customer_address'] ?? null,
            ]);
            $customerId = $customer->id;
        }

        // --------------------------
        // CREATE SALE
        // --------------------------
        $sale = Salee::create([
            'sale_type' => $validated['sale_type'],
            'branch_id' => $validated['branch_id'],
            'created_by' => auth()->id() ?? 1,
            'customer_id' => $customerId,
            'subtotal' => 0,
            'vat_amount' => 0,
            'grand_total' => 0,
        ]);

        $subtotal = 0;
        $totalVat = 0;

        // --------------------------
        // LOOP ITEMS
        // --------------------------
        foreach ($validated['items'] as $it) {
            $item = Item::where('item_code', $it['item_code'])->first();
            if ($item->initial_stock < $it['quantity']) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Not enough stock for ' . $it['item_code']
                ], 400);
            }

            $item->decrement('initial_stock', $it['quantity']);

            $itemTotal = $it['quantity'] * $it['unit_price'];
            $vatAmount = ($itemTotal * ($it['vat_percent'] ?? 0)) / 100;

            $subtotal += $itemTotal;
            $totalVat += $vatAmount;

            SaleItem::create([
                'sale_id' => $sale->id,
                'item_code' => $it['item_code'],
                'quantity' => $it['quantity'],
                'unit_price' => $it['unit_price'],
                'total_price' => $itemTotal,
                'vat_percent' => $it['vat_percent'] ?? 0,
            ]);
        }

        // --------------------------
        // UPDATE SALE TOTALS
        // --------------------------
        $sale->subtotal = $subtotal;
        $sale->vat_amount = $totalVat;
        $sale->grand_total = $subtotal + $totalVat;
        $sale->save();

        // --------------------------
        // CREATE RECEIPT IF APPLICABLE
        // --------------------------
        if ($sale->sale_type === 'with_receipt') {
            $receipt = new SaleReceipt([
                'salee_id' => $sale->id,
                'receipt_unit_price' => $validated['receipt_unit_price'] ?? $sale->grand_total,
                'receipt_total_price' => $validated['receipt_total_price'] ?? $sale->grand_total,
                'vat_collected' => $validated['vat_collected'] ?? $totalVat,
                'receipt_date' => now(),
                'customer_name' => $validated['customer_name'] ?? $sale->customer->full_name ?? null,
                'customer_phone' => $validated['customer_phone'] ?? $sale->customer->phone ?? null,
                'payment_type' => $validated['payment_type'] ?? 'cash',
                'paid_amount' => $validated['paid_amount'] ?? $sale->grand_total,
                'branch_id' => $sale->branch_id,
                'created_by' => auth()->id() ?? 1,
                'images' => [], // Initialize empty array
            ]);

            // --------------------------
            // HANDLE RECEIPT IMAGES
            // --------------------------
            if ($request->hasFile('receipt_images')) {
                $images = [];
                foreach ($request->file('receipt_images') as $file) {
                    $images[] = $file->store('receipt_images', 'public');
                }
                $receipt->images = $images;
            }

            $receipt->save();
        }

        DB::commit();

        return response()->json(
            $sale->load('items','customer','branch','creator','receipt'),
            201
        );

    } catch (\Throwable $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed',
            'error' => $e->getMessage()
        ], 500);
    }
}




    // PUT /salee/{id}
    public function update(Request $request, Salee $sale)
    {
        $validated = $request->validate([
            'sale_type' => 'nullable|in:with_receipt,without_receipt',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $sale->update($validated);

        return response()->json($sale->load('items','customer','branch','creator'));
    }

    // DELETE /salee/{id}
    public function destroy(Salee $sale)
    {
        $sale->delete();
        return response()->json(['message'=>'Sale deleted successfully']);
    }
}
