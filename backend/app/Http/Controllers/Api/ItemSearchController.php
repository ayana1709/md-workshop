<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemSearchController extends Controller
{
    /**
     * Search items for autocomplete
     */
    public function autocomplete(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $query = trim((string) $request->input('q'));
            $limit = $request->input('limit', 15);

            // Scout search
            $items = Item::search($query)
                ->take($limit)
                ->get();

            if ($items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No items matched your search.',
                    'data' => [],
                ], 200);
            }

            // Items with stock
            $inStock = $items->filter(fn ($item) => $item->quantity > 0);
            $outOfStock = $items->filter(fn ($item) => $item->quantity <= 0);

            if ($inStock->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item found, but it is currently out of stock.',
                    'data' => $outOfStock->map(fn ($item) => [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'part_number' => $item->part_number,
                        'brand' => $item->brand,
                        'quantity' => $item->quantity,
                        'out_of_stock' => true,
                    ]),
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => $outOfStock->isNotEmpty()
                    ? 'Some items are out of stock.'
                    : 'Items available.',
                'data' => $inStock->map(fn ($item) => [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'part_number' => $item->part_number,
                    'brand' => $item->brand,
                    'unit' => $item->unit,
                    'selling_price' => $item->selling_price,
                    'quantity' => $item->quantity,
                    'image' => $item->image,
                    'out_of_stock' => false,
                ]),
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Full search with pagination
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $request->input('q', '');
        $perPage = $request->input('per_page', 20);

        if (empty($query)) {
            // Return recent items if no query
            $items = Item::orderBy('created_at', 'desc')
                ->paginate($perPage);
        } else {
            // Use Scout for searching with pagination
            $items = Item::search($query)->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'total' => $items->total(),
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'last_page' => $items->lastPage(),
        ]);
    }
}
