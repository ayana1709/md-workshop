<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class ItemController extends Controller
{


public function index(Request $request)
{
    $query = $request->query('search');
    $perPage = $request->query('limit', 10);

    if ($query && $query !== 'undefined') {
        // Scout search with pagination
        $items = Item::search($query)->paginate($perPage);
    } else {
        // Regular Eloquent pagination
        $items = Item::latest()->paginate($perPage);
    }

    return response()->json($items);
}
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
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = strtoupper(substr(uniqid(), -8));
        }

        if ($request->hasFile('image')) {

            $file = $request->file('image');

            if ($file->getSize() > 2 * 1024 * 1024) {

                $image = Image::make($file)->encode('jpg', 70);

                $filename = 'items/' . uniqid() . '.jpg';

                Storage::disk('public')->put($filename, (string) $image);

                $validated['image'] = $filename;
            } else {
                $validated['image'] = $file->store('items', 'public');
            }
        }

        $validated['purchase_price'] = $validated['purchase_price'] ?? 0;
        $validated['selling_price'] = $validated['selling_price'] ?? 0;
        $validated['quantity'] = $validated['quantity'] ?? 0;
        $validated['total_price'] = $validated['total_price'] ?? ($validated['quantity'] * $validated['purchase_price']);

        if (! empty($validated['part_number'])) {
            $existingItem = Item::where('part_number', $validated['part_number'])->first();

            if ($existingItem) {
                $existingItem->quantity += $validated['quantity'];
                $existingItem->total_price = $existingItem->quantity * ($existingItem->purchase_price ?? 0);

                if (isset($validated['image'])) {

                    if ($existingItem->image && Storage::disk('public')->exists($existingItem->image)) {
                        Storage::disk('public')->delete($existingItem->image);
                    }

                    $existingItem->image = $validated['image'];
                }

                $existingItem->save();

                return response()->json([
                    'message' => 'Quantity updated for existing item',
                    'item' => $existingItem,
                ], 200);
            }
        }

        $item = Item::create($validated);

        return response()->json([
            'message' => 'Item added successfully',
            'item' => $item,
        ], 201);
    }

    public function getByPartNumber($part_number)
    {
        $item = Item::where('part_number', $part_number)->first();

        if (! $item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);

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
            'shelf_number' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'manufacturing_date' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
        ]);

        if ($request->hasFile('image')) {

            if ($item->image && Storage::disk('public')->exists($item->image)) {
                Storage::disk('public')->delete($item->image);
            }

            $path = $request->file('image')->store('items', 'public');
            $validated['image'] = $path;
        }

        if (isset($validated['quantity']) && isset($validated['unit_price'])) {
            $validated['total_price'] = $validated['quantity'] * $validated['unit_price'];
        }

        $item->update($validated);

        return response()->json([
            'message' => 'Item updated successfully',
            'item' => $item,
        ]);
    }

    public function show($id)
    {
        $item = Item::findOrFail($id);

        return response()->json($item);
    }

    public function fetchSelectedItems(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:items,id',
        ]);

        $items = Item::whereIn('id', $validated['ids'])->get();

        return response()->json([
            'message' => 'Items fetched successfully',
            'items' => $items,
        ]);
    }

    public function destroy($id)
    {
        $item = Item::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function updateField(Request $request, $id)
    {
        $request->validate([
            'field' => 'required|string|in:quantity,unit_price,part_number,purchase_price,selling_price', // added prices
            'value' => 'required|string|min:0',
        ]);

        $item = Item::findOrFail($id);

        $item->{$request->field} = $request->value;

        if (in_array($request->field, ['quantity', 'unit_price', 'purchase_price', 'selling_price'])) {
            $item->total_price = ($item->quantity ?? 0) * ($item->unit_price ?? $item->purchase_price ?? 0);
        }

        $item->save();

        return response()->json([
            'message' => ucfirst($request->field) . ' updated successfully',
            'item' => $item,
        ], 200);
    }

    public function itemOut(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = Item::findOrFail($id);

        if ($request->quantity > $item->quantity) {
            return response()->json(['error' => 'Not enough stock available'], 400);
        }

        $totalPrice = $request->quantity * $item->unit_price;

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

        $item->quantity -= $request->quantity;
        $item->save();

        return response()->json(['message' => 'Item successfully moved out', 'updated_quantity' => $item->quantity]);
    }

public function getOutOfStockItems(Request $request)
{
    $query = $request->query('search');
    $perPage = $request->query('limit', 10);

    // We MUST use paginate() here to get "Type B" response
    if ($query && $query !== 'undefined') {
        $items = Item::search($query)
            ->where('quantity', '<=', 0)
            ->paginate($perPage);
    } else {
        $items = Item::where('quantity', '<=', 0)->orderBy('created_at', 'desc')->paginate($perPage);
    }

    return response()->json($items);
}

public function getLowStockItems(Request $request)
{
    $query = $request->query('search');
    $perPage = $request->query('limit', 10);

    if ($query && $query !== 'undefined') {
        // Search specifically within low stock (1-9)
        $items = Item::search($query)
            ->where('quantity', '>', 0)
            ->where('quantity', '<=', 9)
            ->paginate($perPage);
    } else {
        $items = Item::whereBetween('quantity', [1, 9])
            ->orderBy('quantity', 'asc') // Helpful to see lowest stock first
            ->paginate($perPage);
    }

    return response()->json($items);
}

    public function getItemOutRecords()
    {
        $itemsOut = Item::where('quantity', '=', 0)->get();

        return response()->json($itemsOut, 200);
    }

    public function addMore(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:items,id',
            'part_number' => 'nullable|string',
            'quantity' => 'nullable|integer|min:0',
            // 'unit_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'condition' => 'nullable|string|in:New,Used',
        ]);

        $item = Item::find($validated['id']);

        if ($item) {

            if (isset($validated['quantity'])) {
                $item->quantity = $validated['quantity'];
            }

            if (isset($validated['part_number'])) {
                $item->part_number = $validated['part_number'];
            }

            if (isset($validated['unit_price'])) {
                $item->unit_price = $validated['unit_price'];
            }

            if (isset($validated['purchase_price'])) {
                $item->purchase_price = $validated['purchase_price'];
            }

            if (isset($validated['selling_price'])) {
                $item->selling_price = $validated['selling_price'];
            }

            $item->total_price = $item->quantity * $item->unit_price;

            $item->save();

            return response()->json([
                'message' => 'Item updated successfully with new values',
                'item' => $item,
            ], 200);
        }

        return response()->json([
            'message' => 'Item not found',
        ], 404);
    }

    public function dashboardStats()
    {
        return response()->json([
            'total_items' => Item::count(),
            'total_quantity' => Item::sum('quantity'),
            'out_of_stock' => Item::where('quantity', 0)->count(),
            'low_stock' => Item::where('quantity', '<', 10)->count(),
        ]);
    }

    public function import(Request $request)
    {
        $rows = $request->input('items', []);

        if (! $rows || count($rows) === 0) {
            return response()->json([
                'message' => 'No rows were received for processing.',
                'inserted' => 0,
                'updated' => 0,
            ], 400);
        }

        try {

            $mappedItems = collect($rows)
                ->map(function ($row, $index) {

                    $normalized = [];
                    foreach ($row as $key => $value) {

                        $normalized[strtolower(trim($key))] = trim($value);
                    }

                    $allValues = implode('', array_map('strval', $normalized));
                    if (trim($allValues) === '') {
                        return null;
                    }

                    $item_name =
                        $normalized['item_name'] ??
                        $normalized['item name'] ??
                        $normalized['item'] ??
                        null;

                    $quantity =
                        isset($normalized['quantity']) && $normalized['quantity'] !== '' ? intval($normalized['quantity']) : (isset($normalized['qyt']) && $normalized['qyt'] !== '' ? intval($normalized['qyt']) : (isset($normalized['qty']) && $normalized['qty'] !== '' ? intval($normalized['qty']) : null));

                    if (! $item_name) {
                        throw new \Exception('Row ' . ($index + 1) . ' is missing Item Name');
                    }

                    if ($quantity === null || $quantity === '') {
                        $quantity = 0;
                    }

                    return [
                        'image' => $normalized['image'] ?? null,
                        'item_name' => $item_name,

                        'part_number' => $normalized['part_number'] ?? $normalized['part no.'] ?? $normalized['part number'] ?? null,

                        'brand' => $normalized['brand'] ?? null,
                        'unit' => $normalized['unit'] ?? null,
                        'quantity' => $quantity,

                        'low_quantity' => $normalized['low_quantity'] ?? $normalized['low qty'] ?? 0,

                        'purchase_price' => $normalized['purchase_price'] ?? $normalized['pr price'] ?? 0,

                        'selling_price' => $normalized['selling_price'] ?? $normalized['sl.price'] ?? 0,

                        'least_price' => $normalized['least_price'] ?? $normalized['least price'] ?? 0,

                        'condition' => $normalized['condition'] ?? null,
                        'type' => $normalized['type'] ?? null,
                        'manufacturer' => $normalized['manufacturer'] ?? null,
                        'location' => $normalized['location'] ?? null,

                        'shelf_number' => $normalized['shelf_number'] ?? $normalized['shalf no'] ?? null,

                    ];
                })
                ->filter()
                ->values();

            $items = $mappedItems->toArray();

            $inserted = [];
            $updated = [];

            foreach ($items as $item) {

                foreach ($item as $key => $value) {
                    if ($value === '' || $value === ' ') {
                        $item[$key] = null;
                    }
                }

                $item['purchase_price'] = $item['purchase_price'] ?? 0;
                $item['selling_price'] = $item['selling_price'] ?? 0;
                $item['least_price'] = $item['least_price'] ?? 0;
                $item['low_quantity'] = $item['low_quantity'] ?? 0;

                $item['condition'] = $item['condition'] ?? 'New';
                $item['brand'] = $item['brand'] ?? 'N/A';
                $item['unit'] = $item['unit'] ?? 'Pcs';
                $item['type'] = $item['type'] ?? 'General';
                $item['manufacturer'] = $item['manufacturer'] ?? 'Unknown';
                $item['location'] = $item['location'] ?? 'Warehouse';
                $item['shelf_number'] = $item['shelf_number'] ?? 'N/A';

                if (empty($item['part_number'])) {
                    do {
                        $pn = 'PN-' . strtoupper(Str::random(8));
                    } while (Item::where('part_number', $pn)->exists());

                    $item['part_number'] = $pn;
                }

                $item['code'] = strtoupper(substr(uniqid(), -8));

                $item['total_price'] = $item['quantity'] * ($item['purchase_price'] ?? 0);

                if (empty($item['image'])) {
                    $item['image'] = 'items/default.jpg';
                }

                try {
                    $created = Item::create($item);
                    $inserted[] = $created;
                } catch (\Illuminate\Database\QueryException $e) {
                    Log::error('Import QueryException (Skipped): Item failed DB insert. Message: ' . $e->getMessage(), ['item_data' => $item]);
                }
            }

            // 4. Return Final Counts
            return response()->json([
                'message' => 'Import completed successfully',
                'inserted' => count($inserted),
                'updated' => count($updated),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 400);
        }
    }
}
