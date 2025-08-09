<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Item;
use App\Models\ItemOut;
use Illuminate\Support\Facades\DB;
class ItemController extends Controller {
    // Fetch all items
    public function index() {
        return response()->json(Item::all());
    }

    // Store a new item
   public function store(Request $request)
{
    // Validate fields
    $validated = $request->validate([
        'code' => 'nullable|string|max:20',
        'part_number' => 'nullable|string|max:255',
        'item_name' => 'nullable|string|max:255',
        'quantity' => 'nullable|integer|min:0',
        'brand' => 'nullable|string|max:255',
        'model' => 'nullable|string|max:255',
        'unit_price' => 'nullable|numeric|min:0',
        'total_price' => 'nullable|numeric|min:0',
        'location' => 'nullable|string|max:255',
        'condition' => 'required|in:New,Used',
        'unit' => 'nullable|string|max:255',
        'purchase_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'least_price' => 'nullable|numeric|min:0',
        'maximum_price' => 'nullable|numeric|min:0',
        'minimum_quantity' => 'nullable|integer|min:0',
        'low_quantity' => 'nullable|integer|min:0',
        'manufacturer' => 'nullable|string|max:255',
        'manufacturing_date' => 'nullable|date',
        'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
    ]);

    // Auto-generate code if not provided
    if (empty($validated['code'])) {
        $validated['code'] = strtoupper(substr(uniqid(), -8));
    }

    // Handle image upload
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('items', 'public');
        $validated['image'] = $path;
    }

    // Check if item already exists by part_number
    if (!empty($validated['part_number'])) {
        $existingItem = Item::where('part_number', $validated['part_number'])->first();

        if ($existingItem) {
            // If exists, update quantity & optionally replace image
            $existingItem->quantity += $validated['quantity'] ?? 0;
            $existingItem->total_price = $existingItem->quantity * ($existingItem->unit_price ?? 0);

            if (isset($validated['image'])) {
                // Delete old image if exists
                if ($existingItem->image && \Storage::disk('public')->exists($existingItem->image)) {
                    \Storage::disk('public')->delete($existingItem->image);
                }
                $existingItem->image = $validated['image'];
            }

            $existingItem->save();

            return response()->json([
                'message' => 'Quantity updated for existing item',
                'item' => $existingItem
            ], 200);
        }
    }

    // Create new item
    $item = Item::create($validated);

    return response()->json([
        'message' => 'Item added successfully',
        'item' => $item
    ], 201);
}

    
    public function getByPartNumber($part_number)
{
    $item = Item::where('part_number', $part_number)->first();

    if (!$item) {
        return response()->json(['message' => 'Item not found'], 404);
    }

    return response()->json($item);
}

    

    // Fetch a single item
    public function show($id) {
        $item = Item::findOrFail($id);
        return response()->json($item);
    }


public function fetchSelectedItems(Request $request)
{
    // Validate the request
    $validated = $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'integer|exists:items,id',
    ]);

    // Fetch the items using the IDs
    $items = Item::whereIn('id', $validated['ids'])->get();

    return response()->json([
        'message' => 'Items fetched successfully',
        'items' => $items,
    ]);
}


   // Update an item
public function update(Request $request, $id) {
    // Find the item by ID
    $item = Item::findOrFail($id);

    // Validate all fields, including the new ones
    $validated = $request->validate([
        'description' => 'nullable|string',
        'part_number' => 'required|string',
        'quantity' => 'nullable|integer|min:0',
        'brand' => 'nullable|string',
        'model' => 'nullable|string',
        'unit_price' => 'nullable|numeric|min:0',
        'total_price' => 'nullable|numeric|min:0',
        'location' => 'nullable|string',
        'condition' => 'nullable|in:New,Used',
        'item_name' => 'nullable|string',
        'unit' => 'nullable|string',
        'purchase_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'least_price' => 'nullable|numeric|min:0',
        'maximum_price' => 'nullable|numeric|min:0',
        'minimum_quantity' => 'nullable|integer|min:0',
        'low_quantity' => 'nullable|integer|min:0',
        'manufacturer' => 'nullable|string',
        'manufacturing_date' => 'nullable|date',
    ]);

    // Update the item with validated data
    $item->update($validated);

    // Return the response
    return response()->json([
        'message' => 'Item updated successfully',
        'item' => $item
    ]);
}


    // Delete an item
    public function destroy($id) {
        $item = Item::findOrFail($id);
        $item->delete();

        // Return a success message
        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function updateField(Request $request, $id)
    {
        // Validate the request input
        $request->validate([
            'field' => 'required|string|in:quantity,unit_price,part_number', // Allowed fields
            'value' => 'required|numeric|min:0', // Value must be numeric
        ]);

        // Find the item by ID
        $item = Item::findOrFail($id);

        // Update the requested field
        $item->{$request->field} = $request->value;

        // If updating quantity or unit price, recalculate total price
        if ($request->field === 'quantity' || $request->field === 'unit_price') {
            $item->total_price = $item->quantity * $item->unit_price;
        }

        // Save the updated item
        $item->save();

        return response()->json([
            'message' => ucfirst($request->field) . ' updated successfully',
            'item' => $item
        ], 200);
    }



public function itemOut(Request $request, $id) {
    $request->validate([
        'quantity' => 'required|integer|min:1',
    ]);

    $item = Item::findOrFail($id);

    if ($request->quantity > $item->quantity) {
        return response()->json(['error' => 'Not enough stock available'], 400);
    }

    // Calculate total price for the quantity moved out
    $totalPrice = $request->quantity * $item->unit_price;

    // Store full item details in item_out table
    ItemOut::create([
        'item_id' => $item->id,
        'part_number' => $item->part_number,
        'description' => $item->description,
        'brand' => $item->brand,
        'model' => $item->model,
        'condition' => $item->condition,
        'quantity' => $request->quantity,
        'unit_price' => $item->unit_price,
        'total_price' => $totalPrice,
        'location' => $item->location,
        'date' => now(),
    ]);

    // Reduce quantity in items table
    $item->quantity -= $request->quantity;
    $item->save();

    return response()->json(['message' => 'Item successfully moved out', 'updated_quantity' => $item->quantity]);
}



public function getOutOfStockItems()
{
    $items = Item::where('quantity', 0)->get();

    // If no items are found, return an empty array
    return response()->json($items->isEmpty() ? [] : $items);
}

public function getLowStockItems()
{
    $items = Item::where('quantity', '<', 10)->get();

    if ($items->isEmpty()) {
        return response()->json(['message' => 'No low-stock items found', 'items' => []], 200);
    }

    return response()->json($items);
}


public function getItemOutRecords()
{
    // Filter items where quantity is 0 (out of stock)
    $itemsOut = Item::where('quantity', '=', 0)->get();

    return response()->json($itemsOut, 200);
}


public function addMore(Request $request)
{
    // Validate the input fields
    $validated = $request->validate([
        'id' => 'required|integer|exists:items,id', // require ID and ensure it exists
        'part_number' => 'nullable|string',
        'quantity' => 'nullable|integer|min:0',
        'unit_price' => 'nullable|numeric|min:0',
        'purchase_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'condition' => 'nullable|string|in:New,Used',
    ]);

    // Find the item by ID
    $item = Item::find($validated['id']);

    if ($item) {
        // Replace quantity with the new one (no +=)
        if (isset($validated['quantity'])) {
            $item->quantity = $validated['quantity'];
        }
         // Update part number if provided
         if (isset($validated['part_number'])) {
            $item->part_number = $validated['part_number'];
        }

        // Optional updates to other fields if provided
        if (isset($validated['unit_price'])) {
            $item->unit_price = $validated['unit_price'];
        }

        if (isset($validated['purchase_price'])) {
            $item->purchase_price = $validated['purchase_price'];
        }

        if (isset($validated['selling_price'])) {
            $item->selling_price = $validated['selling_price'];
        }

        // Recalculate total_price
        $item->total_price = $item->quantity * $item->unit_price;

        $item->save();

        return response()->json([
            'message' => 'Item updated successfully with new values',
            'item' => $item
        ], 200);
    }

    return response()->json([
        'message' => 'Item not found',
    ], 404);
}



public function import(Request $request)
{
    $validated = $request->validate([
        'items' => 'required|array',
        'items.*.part_number' => 'nullable|string',
        'items.*.description' => 'nullable|string',
        'items.*.quantity' => 'nullable|integer|min:0',
        'items.*.brand' => 'nullable|string',
        'items.*.model' => 'nullable|string',
        'items.*.unit_price' => 'nullable|numeric|min:0',
        'items.*.total_price' => 'nullable|numeric|min:0',
        'items.*.location' => 'nullable|string',
        'items.*.condition' => 'required|string|in:New,Used',
        'items.*.item_name' => 'nullable|string',
        'items.*.unit' => 'nullable|string',
        'items.*.purchase_price' => 'nullable|numeric|min:0',
        'items.*.selling_price' => 'nullable|numeric|min:0',
        'items.*.least_price' => 'nullable|numeric|min:0',
        'items.*.maximum_price' => 'nullable|numeric|min:0',
        'items.*.minimum_quantity' => 'nullable|integer|min:0',
        'items.*.low_quantity' => 'nullable|integer|min:0',
        'items.*.manufacturer' => 'nullable|string',
        'items.*.manufacturing_date' => 'nullable|date',
    ]);

    $items = $validated['items'];

    // Get part numbers from imported data
    $partNumbers = collect($items)->pluck('part_number')->filter()->unique();

    // Fetch existing items by part_number
    $existingItems = Item::whereIn('part_number', $partNumbers)->get()->keyBy('part_number');

    $toInsert = [];
    $toUpdate = [];

    foreach ($items as $item) {
        $partNumber = $item['part_number'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $unitPrice = $item['unit_price'] ?? 0;

        if ($partNumber && $existingItems->has($partNumber)) {
            $existing = $existingItems[$partNumber];

            // Update fields and queue for bulk update
            $existing->quantity += $quantity;
            $existing->total_price = $existing->quantity * $existing->unit_price;
            $toUpdate[] = $existing;
        } else {
            // Calculate total price if not provided
            if (!isset($item['total_price'])) {
                $item['total_price'] = $quantity * $unitPrice;
            }
            $toInsert[] = $item;
        }
    }

    // Perform bulk insert
    if (!empty($toInsert)) {
        Item::insert($toInsert);
    }

    // Perform bulk update (loop required unless using advanced DB-specific logic)
    foreach ($toUpdate as $item) {
        $item->save();
    }

    return response()->json([
        'message' => 'Items imported successfully',
        'inserted' => count($toInsert),
        'updated' => count($toUpdate),
    ]);
}


}









