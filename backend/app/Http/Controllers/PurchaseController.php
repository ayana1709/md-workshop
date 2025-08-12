<?php
namespace App\Http\Controllers;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StoreItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            '*.purchaseDate' => 'required|string',
            '*.purchasedBy' => 'required|string',
            '*.receivedBy' => 'required|string',
            '*.paymentMethod' => 'required|string',
            '*.paymentStatus' => 'required|string',
            '*.code' => 'required|string',
            '*.item_name' => 'required|string',
            '*.partNumber' => 'nullable|string',
            '*.quantity' => 'required|integer',
            '*.brand' => 'nullable|string',
            '*.model' => 'nullable|string',
            '*.unitPrice' => 'required|numeric',
            '*.totalPrice' => 'required|numeric',
            '*.location' => 'required|string',
            '*.condition' => 'required|string',
        ]);
    
        try {
            DB::beginTransaction();
    
            $firstItem = $request->all()[0];
    
            // Create the purchase
            $purchase = Purchase::create([
                'purchase_date' => $firstItem['purchaseDate'],
                'purchased_by' => $firstItem['purchasedBy'],
                'received_by' => $firstItem['receivedBy'],
                'payment_method' => $firstItem['paymentMethod'],
                'payment_status' => $firstItem['paymentStatus'],
            ]);
    
            foreach ($request->all() as $item) {
                // Check if the item exists in store
                $existingStoreItem = StoreItem::where('code', $item['code'])->first();
    
                if ($existingStoreItem) {
                    // ✅ Update the quantity in store
                    $existingStoreItem->update([
                        'quantity' => $existingStoreItem->quantity + $item['quantity'],
                        'totalPrice' => ($existingStoreItem->quantity + $item['quantity']) * $existingStoreItem->unitPrice
                    ]);
    
                    $storeItemId = $existingStoreItem->id;
                } else {
                    // ✅ Create a new store item
                    $newStoreItem = StoreItem::create([
                        'code' => $item['code'],
                        'item_name' => $item['item_name'],
                        'partNumber' => $item['partNumber'],
                        'quantity' => $item['quantity'],
                        'brand' => $item['brand'],
                        'model' => $item['model'],
                        'condition' => $item['condition'],
                        'unitPrice' => $item['unitPrice'],
                        'totalPrice' => $item['totalPrice'],
                        'location' => $item['location'],
                    ]);
    
                    $storeItemId = $newStoreItem->id;
                }
    
                // Store the purchase item and link to the store item
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'store_item_id' => $storeItemId,
                    'code' => $item['code'],
                    'item_name' => $item['item_name'],
                    'part_number' => $item['partNumber'],
                    'quantity' => $item['quantity'],
                    'brand' => $item['brand'],
                    'model' => $item['model'],
                    'unit_price' => $item['unitPrice'],
                    'total_price' => $item['totalPrice'],
                    'location' => $item['location'],
                    'condition' => $item['condition'],
                ]);
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'Purchase and items saved successfully!',
                'purchase' => $purchase->load('items')
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error saving purchase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        // Fetch only purchases (without items)
        $purchases = Purchase::all();

        return response()->json($purchases, 200);
    }
    

}

