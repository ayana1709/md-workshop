<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Models\Sale;
use App\Models\Item;

use Illuminate\Http\Request;



class SaleController extends Controller
{
public function store(Request $request)
{
    $data = $request->validate([
        'sales_date' => 'required|date',
        'customer_name' => 'nullable|string',
        'company_name' => 'nullable|string',
        'tin_number' => 'nullable|string',
        'approved_by' => 'nullable|string',

        'vat_rate' => 'nullable|numeric',
        'discount' => 'nullable|numeric',
        'due_amount' => 'nullable|numeric',
        'paid_amount' => 'nullable|numeric',
        'sub_total' => 'nullable|numeric',
        'total_amount' => 'nullable|numeric',

        'mobile' => 'nullable|string',
        'office' => 'nullable|string',
        'phone' => 'nullable|string',
        'website' => 'nullable|string',
        'email' => 'nullable|email',
        'address' => 'nullable|string',
        'bank_account' => 'nullable|string',
        'payment_status' => 'nullable|string',
        'payment_type' => 'nullable|string',
        'remark' => 'nullable|string',
        'other_info' => 'nullable|string',

        // NEW FIELDS
        'location' => 'nullable|string',
        'delivered_by' => 'nullable|string',
        'requested_date' => 'nullable|date',
        'status' => 'nullable|string',

        'items' => 'required|array',
        'items.*.part_number' => 'nullable|string',
        'items.*.item_name' => 'nullable|string',
        'items.*.brand' => 'nullable|string',
        'items.*.unit' => 'nullable|string',
        'items.*.selling_price' => 'required|numeric',
        'items.*.sale_quantity' => 'required|integer|min:1',
    ]);

    try {
        DB::beginTransaction();

        // AUTO GENERATE REF NUMBER
        $data['ref_num'] = $this->generateRefNum();

        // CREATE SALE RECORD
        $sale = Sale::create([
            'ref_num'       => $data['ref_num'],
            'approved_by'   => $data['approved_by'] ?? null,

            'sales_date'    => $data['sales_date'],
            'customer_name' => $data['customer_name'],
            'company_name'  => $data['company_name'],
            'tin_number'    => $data['tin_number'],

            'vat_rate'      => $data['vat_rate'],
            'discount'      => $data['discount'],
            'due_amount'    => $data['due_amount'],
            'paid_amount'   => $data['paid_amount'],
            'total_amount'  => $data['total_amount'],
            'sub_total'     => $data['sub_total'],

            'mobile'        => $data['mobile'],
            'office'        => $data['office'],
            'phone'         => $data['phone'],
            'website'       => $data['website'],
            'email'         => $data['email'],
            'address'       => $data['address'],
            'bank_account'  => $data['bank_account'],
        'payment_status'=> $data['payment_status'] ?? null,
            // 'payment_type'  => $data['payment_type'],
            'remark'        => $data['remark']??  null,
            'other_info'    => $data['other_info'],

            // NEW FIELDS
            'location'      => $data['location'] ?? null,
            'delivered_by'  => $data['delivered_by'] ?? null,
            'requested_date'=> $data['requested_date'] ?? null,
            'status'        => $data['status'] ?? 'Store Out Request',
        ]);

        // ATTACH ITEMS + UPDATE STOCK
        foreach ($data['items'] as $itemData) {

            // FIND ITEM
            $item = Item::where('part_number', $itemData['part_number'])->first();

            if (!$item) {
                throw new \Exception("Item with part number {$itemData['part_number']} not found.");
            }

            // CHECK STOCK
            if ($item->quantity < $itemData['sale_quantity']) {
                throw new \Exception("Not enough stock for item {$itemData['part_number']}");
            }

            // ATTACH TO SALE
            $sale->items()->attach($item->id, [
                'item_name'       => $itemData['item_name'],
                'part_number'     => $itemData['part_number'],
                'brand'           => $itemData['brand'],
                'unit'            => $itemData['unit'],
                'selling_price'   => $itemData['selling_price'],
                'sale_quantity'   => $itemData['sale_quantity'],
            ]);

            // DECREASE STOCK
            $item->decrement('quantity', $itemData['sale_quantity']);
        }

        DB::commit();

        return response()->json(['message' => 'Sale recorded successfully'], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}




// 🔹 PUBLIC method for API - returns next ref number as JSON
public function latestRef()
{
    return response()->json([
        'latest_ref' => $this->generateRefNum()
    ], 200);
}

// 🔹 PRIVATE generator method - used internally
private function generateRefNum()
{
    $lastSale = Sale::orderBy('id', 'desc')->first();

    if (!$lastSale || !$lastSale->ref_num) {
        return 'REF-0001';
    }

    // Extract digits from the end
    preg_match('/(\d+)$/', $lastSale->ref_num, $matches);
    $number = isset($matches[1]) ? intval($matches[1]) + 1 : 1;

    return 'REF-' . str_pad($number, 4, '0', STR_PAD_LEFT);
}



public function index()
{
    $sales = Sale::with('items')->get();

    return response()->json($sales);
}


public function update(Request $request, $id)
{
    $data = $request->validate([
        'sales_date' => 'required|date',
        'customer_name' => 'nullable|string',
        'company_name' => 'nullable|string',
        'tin_number' => 'nullable|string',
        'approved_by' => 'nullable|string',

        'vat_rate' => 'nullable|numeric',
        'discount' => 'nullable|numeric',
        'due_amount' => 'nullable|numeric',
        'paid_amount' => 'nullable|numeric',
        'sub_total' => 'nullable|numeric',
        'total_amount' => 'nullable|numeric',

        'mobile' => 'nullable|string',
        'office' => 'nullable|string',
        'phone' => 'nullable|string',
        'website' => 'nullable|string',
        'email' => 'nullable|email',
        'address' => 'nullable|string',
        'bank_account' => 'nullable|string',
        'payment_status' => 'nullable|string',
        'payment_type' => 'nullable|string',
        'remark' => 'nullable|string',
        'other_info' => 'nullable|string',

        // NEW FIELDS
        'location' => 'nullable|string',
        'delivered_by' => 'nullable|string',
        'requested_date' => 'nullable|date',
        'status' => 'nullable|string',

        'items' => 'required|array',
        'items.*.part_number' => 'nullable|string',
        'items.*.item_name'   => 'nullable|string',
        'items.*.brand'       => 'nullable|string',
        'items.*.unit'        => 'nullable|string',
        'items.*.selling_price' => 'required|numeric',
        'items.*.sale_quantity' => 'required|integer|min:1',
    ]);

    try {
        DB::beginTransaction();

        $sale = Sale::with('items')->findOrFail($id);

        /**
         * STEP 1 — RESTORE OLD STOCK
         */
        foreach ($sale->items as $oldItem) {
            $itemModel = Item::find($oldItem->pivot->item_id);
            if ($itemModel) {
                $itemModel->increment('quantity', $oldItem->pivot->sale_quantity);
            }
        }

        // Remove pivot items
        $sale->items()->detach();

        /**
         * STEP 2 — UPDATE SALE FIELDS
         */
        $sale->update([
            'sales_date'    => $data['sales_date'],
            'customer_name' => $data['customer_name'],
            'company_name'  => $data['company_name'],
            'tin_number'    => $data['tin_number'],
            'approved_by'   => $data['approved_by'] ?? null,

            'vat_rate'      => $data['vat_rate'],
            'discount'      => $data['discount'],
            'due_amount'    => $data['due_amount'],
            'paid_amount'   => $data['paid_amount'],
            'total_amount'  => $data['total_amount'],
            'sub_total'     => $data['sub_total'],

            'mobile'        => $data['mobile'],
            'office'        => $data['office'],
            'phone'         => $data['phone'],
            'website'       => $data['website'],
            'email'         => $data['email'],
            'address'       => $data['address'],
            'bank_account'  => $data['bank_account'],
            'payment_status'=> $data['payment_status'] ?? null,
            'payment_type'  => $data['payment_type'] ?? null,
            'remark'        => $data['remark'],
            'other_info'    => $data['other_info'],

            // NEW FIELDS
            'location'      => $data['location'] ?? null,
            'delivered_by'  => $data['delivered_by'] ?? null,
            'requested_date'=> $data['requested_date'] ?? null,
            'status'        => $data['status'] ?? $sale->status,
        ]);

        /**
         * STEP 3 — ADD NEW ITEMS + UPDATE STOCK
         */
        foreach ($data['items'] as $itemData) {

            $item = Item::where('part_number', $itemData['part_number'])->first();

            if (!$item) {
                throw new \Exception("Item with part number {$itemData['part_number']} not found.");
            }

            // CHECK STOCK
            if ($item->quantity < $itemData['sale_quantity']) {
                throw new \Exception("Not enough stock for item {$itemData['part_number']}");
            }

            // ATTACH WITH PIVOT DATA
            $sale->items()->attach($item->id, [
                'item_name'     => $itemData['item_name'],
                'part_number'   => $itemData['part_number'],
                'brand'         => $itemData['brand'],
                'unit'          => $itemData['unit'],
                'selling_price' => $itemData['selling_price'],
                'sale_quantity' => $itemData['sale_quantity'],
            ]);

            // REDUCE STOCK
            $item->decrement('quantity', $itemData['sale_quantity']);
        }

        DB::commit();
        return response()->json(['message' => 'Sale updated successfully'], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}







public function show($id)
{
    try {
        // Fetch sale by ID with related items
        $sale = Sale::with('items')->findOrFail($id);

        return response()->json($sale, 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Sale not found'], 404);
    }
}



}
