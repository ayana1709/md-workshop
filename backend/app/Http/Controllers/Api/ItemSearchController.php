<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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
        
        $query = $request->input('q');
        $limit = $request->input('limit', 15);
        
        // Use Scout for searching
        $items = Item::search($query)
            ->take($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'part_number' => $item->part_number,
                    'brand' => $item->brand,
                    'unit' => $item->unit,
                    'selling_price' => $item->selling_price,
                    'quantity' => $item->quantity,
                    'image' => $item->image,
                    // Add any other fields needed
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $items,
            'query' => $query,
        ]);
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