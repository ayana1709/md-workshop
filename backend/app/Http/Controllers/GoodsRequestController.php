<?php

namespace App\Http\Controllers;

use App\Models\GoodsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GoodsRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Simple pagination for the list view
        return GoodsRequest::latest()->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'objective_for' => 'required|string|max:255',
            'priority' => 'required|integer|min:1',
            'requested_by' => 'required|string|max:255',
            'requested_department' => 'required|string|max:255',
            'status' => 'string|max:255',

            // Validation for the nested array items
            'requested_items' => 'required|array|min:1',
            'requested_items.*.item_name' => 'required|string|max:255',
            'requested_items.*.unit' => 'required|string|max:50',
            'requested_items.*.quantity' => 'required|integer|min:1',
            'requested_items.*.remark' => 'nullable|string',

            // Image fields saved from the upload API
            'requested_items.*.image' => 'nullable|string', // storage path
        ]);

        $validatedData['ref_no'] = $this->generateRefNo();

        // The requested_items (including image paths) will be saved as JSON (if configured in Model/Migration)
        $GoodsRequest = GoodsRequest::create($validatedData);

        return response()->json($GoodsRequest, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(GoodsRequest $GoodsRequest)
    {

        return response()->json($GoodsRequest);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GoodsRequest $GoodsRequest)
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'objective_for' => 'required|string|max:255',
            'priority' => 'required|integer|min:1',
            'requested_by' => 'required|string|max:255',
            'requested_department' => 'required|string|max:255',
            'status' => 'string|max:255',

            // Full validation for item array on update
            'requested_items' => 'required|array|min:1',
            'requested_items.*.item_name' => 'required|string|max:255',
            'requested_items.*.unit' => 'required|string|max:50',
            'requested_items.*.quantity' => 'required|integer|min:1',
            'requested_items.*.remark' => 'nullable|string',
            'requested_items.*.image' => 'nullable|string',
        ]);

        $GoodsRequest->update($validatedData);

        return response()->json($GoodsRequest);
    }

    /**
     * Remove the specified resource from storage, and delete associated files.
     */
    public function destroy(GoodsRequest $GoodsRequest)
    {
        // **Image Deletion Logic**
        $requestedItems = $GoodsRequest->requested_items;

        if (is_array($requestedItems)) {
            foreach ($requestedItems as $item) {
                // Check if the item has a stored image path and delete it from storage
                if (! empty($item['image']) && Storage::disk('public')->exists($item['image'])) {
                    Storage::disk('public')->delete($item['image']);
                }
            }
        }

        // Delete the database record
        $GoodsRequest->delete();

        return response()->json(['message' => 'Store request and associated files deleted successfully'], 200);
    }

    private function generateRefNo()
    {
        $attempt = 1;
        do {
            $refNo = 'REF-'.str_pad($attempt, 4, '0', STR_PAD_LEFT);
            $attempt++;
        } while (GoodsRequest::where('ref_no', $refNo)->exists());

        return $refNo;
    }

    // upload image api
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $path = $request->file('image')->store(
            'company/store-requests/items',
            'public'
        );

        return response()->json([
            'path' => $path, // Relative path for database saving
            'url' => asset('storage/'.$path), // Full public URL for frontend display
        ]);
    }
}
