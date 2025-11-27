<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Item;
use App\Models\ItemOut;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;


class ItemController extends Controller {
    // Fetch all items
    public function index() {
        return response()->json(Item::all());
    }

    // Store a new item
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
        'total_price' => 'nullable|numeric|min:0',
        'location' => 'nullable|string|max:255',
        'condition' => 'nullable|string|max:255',
        'unit' => 'nullable|string|max:255',
        'purchase_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'least_price' => 'nullable|numeric|min:0',
        'maximum_price' => 'nullable|numeric|min:0',
        'minimum_quantity' => 'nullable|integer|min:0',
        'low_quantity' => 'nullable|integer|min:0',
        'shelf_number' => 'nullable|string|max:255',
        'type' => 'nullable|string|max:255',
        'manufacturer' => 'nullable|string|max:255',
        'manufacturing_date' => 'nullable|date',
        'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240', // 10MB
    ]);

    // Auto-generate code if not provided
    if (empty($validated['code'])) {
        $validated['code'] = strtoupper(substr(uniqid(), -8));
    }

    // Handle image upload with compression
    if ($request->hasFile('image')) {

        $file = $request->file('image');

        // Check if image is larger than 2MB
        if ($file->getSize() > 2 * 1024 * 1024) {

            // Compress image
            $image = Image::make($file)->encode('jpg', 70); // 70% quality

            // Create unique name
            $filename = 'items/' . uniqid() . '.jpg';

            // Store compressed image
            \Storage::disk('public')->put($filename, (string) $image);

            $validated['image'] = $filename;

        } else {
            // Store normally if <= 2MB
            $validated['image'] = $file->store('items', 'public');
        }
    }

    // Ensure required numeric fields are never null
    $validated['purchase_price'] = $validated['purchase_price'] ?? 0;
    $validated['selling_price']  = $validated['selling_price'] ?? 0;
    $validated['quantity']       = $validated['quantity'] ?? 0;
    $validated['total_price']    = $validated['total_price'] ?? ($validated['quantity'] * $validated['purchase_price']);

    // Check if item already exists by part_number
    if (!empty($validated['part_number'])) {
        $existingItem = Item::where('part_number', $validated['part_number'])->first();

        if ($existingItem) {
            $existingItem->quantity += $validated['quantity'];
            $existingItem->total_price = $existingItem->quantity * ($existingItem->purchase_price ?? 0);

            if (isset($validated['image'])) {

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

    public function update(Request $request, $id)
{
    // Find the item by ID
    $item = Item::findOrFail($id);

    // Validate fields (matching store() rules, without forcing part_number to be required)
    $validated = $request->validate([
        'code' => 'nullable|string|max:20',
        'part_number' => 'nullable|string|max:255',
        'item_name' => 'nullable|string|max:255',
        'quantity' => 'nullable|integer|min:0',
        'brand' => 'nullable|string|max:255',
        'type' => 'nullable|string|max:255',
        // 'unit_price' => 'nullable|numeric|min:0',
        'total_price' => 'nullable|numeric|min:0',
        'location' => 'nullable|string|max:255',
        'condition' => 'nullable|string|max:255',
        'unit' => 'nullable|string|max:255',
        'purchase_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'least_price' => 'nullable|numeric|min:0',
        'maximum_price' => 'nullable|numeric|min:0',
        'minimum_quantity' => 'nullable|integer|min:0',
        'low_quantity' => 'nullable|integer|min:0',
        'shelf_number'=>'nullable|string|max:255',
        'manufacturer' => 'nullable|string|max:255',
        'manufacturing_date' => 'nullable|date',
        'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240', // 10MB

    ]);

    // Handle image upload if provided
    if ($request->hasFile('image')) {
        // Delete old image if exists
        if ($item->image && \Storage::disk('public')->exists($item->image)) {
            \Storage::disk('public')->delete($item->image);
        }

        $path = $request->file('image')->store('items', 'public');
        $validated['image'] = $path;
    }

    // If quantity changes, update total price
    if (isset($validated['quantity']) && isset($validated['unit_price'])) {
        $validated['total_price'] = $validated['quantity'] * $validated['unit_price'];
    }

    // Update the item
    $item->update($validated);

    return response()->json([
        'message' => 'Item updated successfully',
        'item' => $item
    ]);
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


   


    // Delete an item
    public function destroy($id) {
        $item = Item::findOrFail($id);
        $item->delete();

        // Return a success message
        return response()->json(['message' => 'Item deleted successfully']);
    }

   public function updateField(Request $request, $id)
{
    $request->validate([
        'field' => 'required|string|in:quantity,unit_price,part_number,purchase_price,selling_price', // added prices
        'value' => 'required|string|min:0',
    ]);

    $item = Item::findOrFail($id);

    // Update the requested field
    $item->{$request->field} = $request->value;

    // Recalculate total price if relevant
    if (in_array($request->field, ['quantity', 'unit_price', 'purchase_price', 'selling_price'])) {
        $item->total_price = ($item->quantity ?? 0) * ($item->unit_price ?? $item->purchase_price ?? 0);
    }

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
        'type' => $item->type,
        'condition' => $item->condition,
        'quantity' => $request->quantity,
        // 'unit_price' => $item->unit_price,
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
        // 'unit_price' => 'nullable|numeric|min:0',
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
public function dashboardStats()
{
    return response()->json([
        'total_items'      => Item::count(),                         // 1. Number of Total Items
        'total_quantity'   => Item::sum('quantity'),                 // 2. Total Items by QTY
        'out_of_stock'     => Item::where('quantity', 0)->count(),   // 3. Number of Out of Store
        'low_stock'        => Item::where('quantity', '<', 10)->count() // 4. Low Quantity items
    ]);
}


public function import(Request $request)
{
    $rows = $request->input('items', []);

    if (!$rows || count($rows) === 0) {
        return response()->json([
            'message' => 'No rows were received from Excel.',
            'items' => []
        ], 400);
    }

    try {
        $mappedItems = collect($rows)
            ->map(function ($row, $index) {

                // 1. Normalize Headers
                $normalized = [];
                foreach ($row as $key => $value) {
                    $normalized[strtolower(trim($key))] = trim($value);
                }

                // 2. Skip empty rows
                $allValues = implode("", array_map('strval', $normalized));
                if (trim($allValues) === "") {
                    return null;
                }

                // 3. Extract required fields
                $item_name =
                    $normalized['item_name'] ??
                    $normalized['item name'] ??
                    $normalized['item'] ??
                    null;

                $quantity =
                    isset($normalized['quantity']) ? intval($normalized['quantity']) :
                    (isset($normalized['qty']) ? intval($normalized['qty']) : null);

                // 4. Required validations
                if (!$item_name) {
                    throw new \Exception("Row " . ($index + 1) . " is missing Item Name");
                }

                if ($quantity === null || $quantity === "") {
                    throw new \Exception("Row " . ($index + 1) . " is missing Quantity");
                }

                // 5. Mapped clean data
                return [
                    'image'          => $normalized['image'] ?? null,
                    'item_name'      => $item_name,
                    'part_number'    => $normalized['part_number'] ?? null,
                    'brand'          => $normalized['brand'] ?? null,
                    'unit'           => $normalized['unit'] ?? null,
                    'quantity'       => $quantity,
                    'low_quantity'   => $normalized['low_quantity'] ?? 0,
                    'purchase_price' => $normalized['purchase_price'] ?? 0,
                    'selling_price'  => $normalized['selling_price'] ?? 0,
                    'least_price'    => $normalized['least_price'] ?? 0,
                    'condition'      => $normalized['condition'] ?? null,
                    'type'      => $normalized['type'] ?? null,
                    'manufacturer'      => $normalized['manufacturer'] ?? null,
                    'location'   => $normalized['location'] ?? null,
                    'shelf_number'   => $normalized['shelf_number'] ?? null,
                ];
            })
            ->filter()
            ->values();

        $items = $mappedItems->toArray();

        $inserted = [];
        $updated = [];

        foreach ($items as $item) {

            // 0. Convert empty → NULL
            // 0. Convert empty → NULL
foreach ($item as $key => $value) {
    if ($value === "" || $value === " ") {
        $item[$key] = null;
    }
}
// FIX CRITICAL FIELDS → NEVER NULL
$item['purchase_price'] = $item['purchase_price'] ?? 0;
$item['selling_price']  = $item['selling_price'] ?? 0;
$item['least_price']    = $item['least_price'] ?? 0;
$item['low_quantity']   = $item['low_quantity'] ?? 0;
$item['condition']      = $item['condition'] ?? "New";


            // FIX: Condition can never be null (DB restriction)
            if (empty($item['condition'])) {
                $item['condition'] = "New";   // ← Default value
            }

            // AUTO-GENERATE PART NUMBER
            if (empty($item['part_number'])) {
                do {
                    $pn = 'PN-' . strtoupper(Str::random(8));
                } while (Item::where('part_number', $pn)->exists());

                $item['part_number'] = $pn;
            }

            // AUTO GENERATE CODE
            $item['code'] = strtoupper(substr(uniqid(), -8));

            // CALCULATE TOTAL PRICE
            $item['total_price'] = $item['quantity'] * ($item['purchase_price'] ?? 0);

            // CHECK IF ITEM EXISTS BY PART NUMBER OR NAME
          // CHECK IF ITEM EXISTS BY PART NUMBER OR NAME
$existing = Item::where('part_number', $item['part_number'])
    ->orWhereRaw('LOWER(item_name) = ?', [strtolower($item['item_name'])])
    ->first();

if ($existing) {

    $existing->fill($item);
    $existing->quantity += $item['quantity'];
    $existing->total_price =
        $existing->quantity * ($existing->purchase_price ?? 0);
    $existing->save();
    $updated[] = $existing;

} else {
    // Default image if missing
    // Default image for imported items
if (empty($item['image'])) {
    $item['image'] = 'items/default.jpg';
}
    // Create new item
    $created = Item::create($item);
    $inserted[] = $created;
}
        }

        return response()->json([
            'message'  => 'Import completed successfully',
            'inserted' => count($inserted),
            'updated'  => count($updated),
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Import failed: ' . $e->getMessage(),
        ], 400);
    }
}








}









