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

        'items' => 'required|array',
        'items.*.part_number' => 'required|string',
        'items.*.description' => 'nullable|string',
        'items.*.brand' => 'nullable|string',
        'items.*.unit' => 'nullable|string',
        'items.*.unit_price' => 'required|numeric',
        'items.*.sale_quantity' => 'required|integer|min:1',
    ]);

    try {
        DB::beginTransaction();

        // 1. Create sale record
        $sale = Sale::create([
            'sales_date'    => $data['sales_date'],
            'customer_name' => $data['customer_name'],
            'company_name'  => $data['company_name'],
            'tin_number'    => $data['tin_number'],
            'vat_rate'      => $data['vat_rate'],  
            'discount'      => $data['discount'],
            'due_amount'    => $data['due_amount'],
            'paid_amount'    => $data['paid_amount'],
            'total_amount'    => $data['total_amount'],
            'sub_total'    => $data['sub_total'],
            'mobile'        => $data['mobile'],
            'office'        => $data['office'],
            'phone'         => $data['phone'],
            'website'       => $data['website'],
            'email'         => $data['email'],
            'address'       => $data['address'],
            'bank_account'  => $data['bank_account'],
            'payment_status'  => $data['payment_status'],
            'payment_type'  => $data['payment_type'],
            'remark'  => $data['remark'],
            'other_info'    => $data['other_info'],
        ]);

        // 2. Attach items and update stock
        foreach ($data['items'] as $itemData) {
            // Find the item by part number
            $item = Item::where('part_number', $itemData['part_number'])->first();

            if (!$item) {
                throw new \Exception("Item with part number {$itemData['part_number']} not found.");
            }

            // Check if there's enough quantity
            if ($item->quantity < $itemData['sale_quantity']) {
                throw new \Exception("Not enough stock for item {$itemData['part_number']}");
            }

            // Attach item to the sale
            $sale->items()->attach($item->id, [
                'description'   => $itemData['description'],
                'part_number'   => $itemData['part_number'],
                'brand'         => $itemData['brand'],
                'unit'          => $itemData['unit'],
                'unit_price'    => $itemData['unit_price'],
                'sale_quantity' => $itemData['sale_quantity'],
            ]);

            // Subtract sold quantity
            $item->decrement('quantity', $itemData['sale_quantity']);
        }

        DB::commit();

        return response()->json(['message' => 'Sale recorded successfully'], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
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

        'items' => 'required|array',
        'items.*.part_number' => 'required|string',
        'items.*.description' => 'nullable|string',
        'items.*.brand' => 'nullable|string',
        'items.*.unit' => 'nullable|string',
        'items.*.unit_price' => 'required|numeric',
        'items.*.sale_quantity' => 'required|integer|min:1',
    ]);

    try {
        DB::beginTransaction();

        $sale = Sale::findOrFail($id);

        $sale->update($data);

        // Remove existing sale items
        $sale->items()->detach();

        foreach ($data['items'] as $itemData) {
            $item = Item::where('part_number', $itemData['part_number'])->first();

            if (!$item) {
                throw new \Exception("Item with part number {$itemData['part_number']} not found.");
            }

            $sale->items()->attach($item->id, [
                'description'   => $itemData['description'],
                'part_number'   => $itemData['part_number'],
                'brand'         => $itemData['brand'],
                'unit'          => $itemData['unit'],
                'unit_price'    => $itemData['unit_price'],
                'sale_quantity' => $itemData['sale_quantity'],
            ]);
        }

        DB::commit();

        return response()->json(['message' => 'Sale updated successfully']);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


}
