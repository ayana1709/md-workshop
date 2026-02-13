<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movement;
use App\Models\Item;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MovementController extends Controller
{
    /**
     * List all movements
     */
    public function index()
    {
        $movements = Movement::with(['item', 'fromBranch', 'toBranch'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($movements);
    }

    /**
     * Store a new transfer/movement
     */
 public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'from_branch_id' => 'required|exists:branches,id',
        'to_branch_id'   => 'required|exists:branches,id',
        'sender_name'    => 'required|string',
        'sent_by'        => 'required|string',
        'items'          => 'required|array|min:1',
        'items.*.item_code' => 'required|string|exists:items,item_code',
        'items.*.quantity'  => 'required|integer|min:1',
        'notes'          => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors'  => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();

    try {
        foreach ($request->items as $itemData) {
            $quantity = $itemData['quantity'];

            // 1️⃣ Fetch sending branch item
            $fromItem = Item::where('item_code', $itemData['item_code'])
                            ->where('branch_id', $request->from_branch_id)
                            ->firstOrFail();

            if ($fromItem->initial_stock < $quantity) {
                throw new \Exception("Insufficient stock for item {$fromItem->item_name} in sending branch");
            }

            // 2️⃣ Decrease stock from sending branch
            $fromItem->initial_stock -= $quantity;
            $fromItem->save();

            // 3️⃣ Check if receiving branch already has the item (by part_number)
            $toItem = Item::where('part_number', $fromItem->part_number)
                          ->where('branch_id', $request->to_branch_id)
                          ->first();

            if ($toItem) {
                // Already exists → increment stock
                $toItem->initial_stock += $quantity;
                $toItem->save();
            } else {
                // Doesn't exist → create new item in receiving branch
                $newCode = Item::max('item_code');
                $newCode = str_pad(((int)$newCode) + 1, 4, '0', STR_PAD_LEFT);

                $toItem = Item::create([
                    'item_code'   => $newCode,
                    'item_name'   => $fromItem->item_name,
                    'part_number' => $fromItem->part_number,
                    'category_id' => $fromItem->category_id,
                    'brand_id'    => $fromItem->brand_id,
                    'unit'        => $fromItem->unit,
                    'location'    => $fromItem->location,
                    'initial_stock' => $quantity,
                    'low_stock'   => $fromItem->low_stock,
                    'branch_id'   => $request->to_branch_id,
                    'created_by'  => auth()->id() ?? 1,
                    'images'      => $fromItem->images,
                    'qr_code'     => $fromItem->qr_code, // optional: regenerate if needed
                ]);
            }

            // 4️⃣ Create movement record
            Movement::create([
                'item_code'      => $itemData['item_code'],
                'from_branch_id' => $request->from_branch_id,
                'to_branch_id'   => $request->to_branch_id,
                'sender_name'    => $request->sender_name,
                'sent_by'        => $request->sent_by,
                'quantity'       => $quantity,
                'notes'          => $request->notes ?? null,
            ]);
        }

        DB::commit();

        return response()->json([
            'message' => 'Transfer completed successfully'
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Transfer failed',
            'error'   => $e->getMessage()
        ], 500);
    }
}


    /**
     * Show a single movement
     */
    public function show($id)
    {
        $movement = Movement::with(['item', 'fromBranch', 'toBranch'])->findOrFail($id);
        return response()->json($movement);
    }
}
