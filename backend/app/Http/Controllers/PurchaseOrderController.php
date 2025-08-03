<?php

// app/Http/Controllers/PurchaseOrderController.php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Item; // Import the Item model at the top
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sales_date' => 'required|date',
            'supplier_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|integer',
            'items.*.unit_price' => 'required|numeric',
            'items.*.sale_quantity' => 'required|integer',
            'items.*.part_number' => 'required|string', // ensure part number is included
        ]);
    
        DB::beginTransaction();
    
        try {
            $purchaseOrder = PurchaseOrder::create($request->only([
                'sales_date', 'supplier_name', 'company_name', 'reference_number', 'tin_number',
                'mobile', 'office', 'phone', 'website', 'email', 'address',
                'bank_account', 'other_info', 'remark'
            ]));
    
            foreach ($request->items as $item) {
                $purchaseOrder->items()->create($item);
    
                // Update quantity based on part number
                $existingItem = Item::where('part_number', $item['part_number'])->first();
                if ($existingItem) {
                    $existingItem->quantity += $item['sale_quantity'];
                    $existingItem->save();
                }
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'Purchase order created and item quantities updated successfully.',
                'data' => $purchaseOrder->load('items')
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to store purchase order.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    

    public function index()
{
    $orders = PurchaseOrder::with('items')->latest()->get();
    return response()->json($orders);
}

}
