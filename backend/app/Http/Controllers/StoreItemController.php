<?php

// app/Http/Controllers/ItemController.php
namespace App\Http\Controllers;
use App\Models\ItemOut;
use Illuminate\Http\Request;
use App\Models\StoreItem;
use App\Models\ItemHistory;
use Illuminate\Support\Facades\Auth;

class StoreItemController extends Controller
{
    
    
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            '*.code' => 'required|string|unique:store_items,code',
            '*.description' => 'nullable|string',
            '*.partNumber' => 'nullable|string',
            '*.quantity' => 'required|integer|min:1',
            '*.brand' => 'nullable|string',
            '*.model' => 'nullable|string',
            '*.condition' => 'nullable|string',
            '*.unitPrice' => 'nullable|numeric|min:0',
            '*.totalPrice' => 'nullable|numeric|min:0',
            '*.location' => 'nullable|string',
        ]);
    
        $items = StoreItem::insert($validatedData);
    
        foreach ($validatedData as $item) {
            ItemHistory::create([
                'code' => $item['code'],
                'action' => 'Stored',
                'details' => json_encode($item),
                'performed_by' => Auth::user()->name ?? 'System',
            ]);
        }
    
        return response()->json(['message' => 'Store items saved successfully!'], 201);
    }
    

    public function index()
{
    $items = StoreItem::all(); // Fetch all items from the database
    return response()->json(['items' => $items], 200);
}


public function bulkUpdate(Request $request)
{
    $validatedData = $request->validate([
        'items' => 'required|array',
        'items.*.id' => 'required|exists:store_items,id',
        'items.*.code' => 'nullable|string',
        'items.*.partNumber' => 'nullable|string',
        'items.*.description' => 'nullable|string',
        'items.*.quantity' => 'nullable|integer|min:1',
        'items.*.brand' => 'nullable|string',
        'items.*.model' => 'nullable|string',
        'items.*.condition' => 'nullable|string',
        'items.*.location' => 'nullable|string',
        'items.*.unitPrice' => 'nullable|numeric|min:0',
    ]);

    foreach ($validatedData['items'] as $itemData) {
        $item = StoreItem::find($itemData['id']);
        if ($item) {
            // Update item fields
            $item->code = $itemData['code'] ?? $item->code;
            $item->partNumber = $itemData['partNumber'] ?? $item->partNumber;
            $item->description = $itemData['description'] ?? $item->description;
            $item->quantity = $itemData['quantity'] ?? $item->quantity;
            $item->brand = $itemData['brand'] ?? $item->brand;
            $item->model = $itemData['model'] ?? $item->model;
            $item->condition = $itemData['condition'] ?? $item->condition;
            $item->location = $itemData['location'] ?? $item->location;
            $item->unitPrice = $itemData['unitPrice'] ?? $item->unitPrice;

            // Automatically update totalPrice
            if (isset($itemData['quantity']) || isset($itemData['unitPrice'])) {
                $item->totalPrice = ($item->quantity ?? 0) * ($item->unitPrice ?? 0);
            }

            $item->save();
        }
    }
    foreach ($validatedData['items'] as $itemData) {
        $item = StoreItem::find($itemData['id']);
        if ($item) {
            $oldData = $item->toArray();
            $item->update($itemData);

            ItemHistory::create([
                'code' => $item->code,
                'action' => 'Updated',
                'details' => json_encode([
                    'old' => $oldData,
                    'new' => $item->toArray()
                ]),
                'performed_by' => Auth::user()->name ?? 'Admin',
            ]);
        }
    }

    

    return response()->json(['message' => 'Store items updated successfully!'], 200);
}


//item out


public function itemOut(Request $request, $code)
{
    $validatedData = $request->validate([
        'requestquantity' => 'required|integer|min:1',
        'requestedby' => 'required|string',
        'plate_number' => 'required|string' 
    ]);

    $storeItem = StoreItem::where('code', $code)->first();

    if (!$storeItem) {
        return response()->json(['message' => 'Item not found'], 404);
    }

    if ($storeItem->quantity < $validatedData['requestquantity']) {
        return response()->json(['message' => 'Not enough stock available'], 400);
    }

    // Deduct the requested quantity from stock
    $storeItem->quantity -= $validatedData['requestquantity'];
    $storeItem->save();

    // Save the "Item Out" transaction
    ItemOut::create([
        'code' => $storeItem->code,
        'description' => $storeItem->description,
        'partNumber'=>$storeItem->partNumber,
        'plate_number' => $validatedData['plate_number'],
        'brand'=>$storeItem->brand,
        'model'=>$storeItem->model,
        'condition'=>$storeItem->condition,
        'requestquantity' => $validatedData['requestquantity'],
        'unitPrice' => $storeItem->unitPrice,
        'totalPrice' => $storeItem->unitPrice * $validatedData['requestquantity'],
        'requestedby' => $validatedData['requestedby'],
        'date_out' => now(),
    ]);
     // Log history
     ItemHistory::create([
        'code' => $storeItem->code,
        'action' => 'Taken Out',
        'details' => json_encode([
            'quantity' => $validatedData['requestquantity'],
            'requested_by' => $validatedData['requestedby']
        ]),
        'performed_by' => Auth::user()->name ?? 'Admin',
    ]);


    return response()->json(['message' => 'Item successfully taken out', 'updatedItem' => $storeItem], 200);
}








public function getHistory($code)
{
    $history = ItemHistory::where('code', $code)->orderBy('created_at', 'desc')->get();
    return response()->json(['history' => $history]);
}

public function getTotalItems()
{
    $totalItems = StoreItem::sum('quantity');
    return response()->json(['total_items' => $totalItems], 200);
}

public function getTotalItemsOut()
{
    $totalItemsOut = ItemOut::sum('requestquantity');
    return response()->json(['total_items_out' => $totalItemsOut], 200);
}




}


