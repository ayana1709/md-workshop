<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Item;
use App\Models\ItemOut;
use App\Models\Purchasee;
use App\Models\Salee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;



use Illuminate\Validation\ValidationException;
class ItemController extends Controller
{

public function index(Request $request)
{
    $branchId = $request->query('branch_id');
    $user = auth()->user();
    $isAdmin = $user->is_admin ?? false;

    $query = Item::with([
        'category:id,name',
        'brand:id,name',
        'branch:id,name',
        'creator:id,name',
        'purchases', // ✅ correct relation
        'sales',     // ✅ correct relation
    ]);

    if (!$isAdmin && $branchId) {
        $query->where('branch_id', $branchId);
    }

    $items = $query->get();

    return response()->json($items);
}


public function store(Request $request)
{
    $validated = $request->validate([
        'item_name' => 'required|string|max:255',
        'part_number' => 'nullable|string|max:255',
        'category_id' => 'nullable|exists:categories,id',
        'brand_id'    => 'nullable|exists:brands,id',
        'unit'        => 'required|string|max:50',
        'location'    => 'nullable|string|max:255',
        'initial_stock' => 'required|integer|min:0',
        'low_stock' => 'nullable|integer|min:0',
        'purchase_type' => 'required|in:with_receipt,without_receipt',
        'purchase_price' => 'nullable|numeric|min:0',
        'purchase_receipt_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'branch_id' => 'nullable|exists:branches,id',
        'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
        'invoice_number' => 'nullable|string|max:100',
        'invoice_date' => 'nullable|date',
        'invoice_image' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
    ]);

    DB::beginTransaction();

    try {
        $userId = auth()->id() ?? 1;

        // Generate new item code
        $lastCode = Item::max('item_code');
        $newCode = str_pad(((int)$lastCode) + 1, 4, '0', STR_PAD_LEFT);

        // Create Item
        $item = Item::create([
            'item_code'   => $newCode,
            'item_name'   => $validated['item_name'],
            'part_number' => $validated['part_number'] ?? 'PN-' . Str::upper(Str::random(8)),
            'category_id' => $validated['category_id'] ?? null,
            'brand_id'    => $validated['brand_id'] ?? null,
            'unit'        => $validated['unit'],
            'location'    => $validated['location'] ?? 'Warehouse',
            'initial_stock' => $validated['initial_stock'],
            'low_stock'   => $validated['low_stock'] ?? null,
            'branch_id'   => $validated['branch_id'],
            'created_by'  => $userId,
            'selling_price' => $validated['selling_price'] ?? 0,
        ]);

        // Handle item images
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('items', 'public');
            }
        }
        $item->images = json_encode(empty($imagePaths) ? ['items/default.jpg'] : $imagePaths);
        $item->save();

        // QR code generation
        $qrDir = storage_path('app/public/qrcodes');
        if (!file_exists($qrDir)) mkdir($qrDir, 0777, true);
        $qrFileName = 'item_' . $item->item_code . '.svg';
        QrCode::format('svg')->size(300)->generate($item->item_code, $qrDir . '/' . $qrFileName);
        $item->qr_code = 'qrcodes/' . $qrFileName;
        $item->save();

        // INITIAL PURCHASE
        $quantity = $validated['initial_stock'] ?? 0;
        $purchasePrice = $validated['purchase_price'] ?? 0;

        $purchase = Purchasee::create([
            'item_code' => $item->item_code,
            'quantity' => $quantity,
            'actual_unit_price' => $purchasePrice,
            'actual_total_price' => $purchasePrice * $quantity,
            'purchase_type' => $validated['purchase_type'],
            'branch_id' => $validated['branch_id'],
            'created_by' => $userId,
        ]);

        // PURCHASE RECEIPT (if with_receipt)
        if ($purchase->purchase_type === 'with_receipt' && !empty($validated['purchase_receipt_price'])) {
            $receiptUnitPrice  = $validated['purchase_receipt_price'];
            $receiptTotalPrice = $receiptUnitPrice * $quantity;
            $vatPaid = round($receiptTotalPrice * 0.15, 2);

            $receiptData = [
                'receipt_unit_price'  => $receiptUnitPrice,
                'receipt_total_price' => $receiptTotalPrice,
                'vat_paid'            => $vatPaid,
                'receipt_date'        => now(),
                'branch_id'           => $validated['branch_id'],
                'created_by'          => $userId,
            ];

            // Add invoice details
            if (!empty($validated['invoice_number'])) $receiptData['invoice_number'] = $validated['invoice_number'];
            if (!empty($validated['invoice_date'])) $receiptData['invoice_date'] = $validated['invoice_date'];

            // Handle invoice image
            if ($request->hasFile('invoice_image')) {
                $receiptData['invoice_image'] = $request->file('invoice_image')->store('invoices', 'public');
            }

            $purchase->receipt()->create($receiptData);
        }

        DB::commit();

        return response()->json([
            'message' => 'Item added successfully',
            'item' => $item,
            'qr_url' => asset('storage/' . $item->qr_code),
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to add item',
            'error' => $e->getMessage(),
        ], 500);
    }
}


public function update(Request $request, $item_code)
{
    $item = Item::where('item_code', $item_code)->firstOrFail();

    $validated = $request->validate([
        'item_name' => 'required|string|max:255',
        'part_number' => 'nullable|string|max:255',
        'category_id' => 'nullable|exists:categories,id',
        'brand_id'    => 'nullable|exists:brands,id',
        'unit'        => 'required|string|max:50',
        'location'    => 'nullable|string|max:255',
        'initial_stock' => 'nullable|integer|min:0',
        'low_stock' => 'nullable|integer|min:0',
        'purchase_type' => 'nullable|in:with_receipt,without_receipt',
        'purchase_price' => 'nullable|numeric|min:0',
        'purchase_receipt_price' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'branch_id' => 'nullable|exists:branches,id',
        'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
        'invoice_number' => 'nullable|string|max:100',
        'invoice_date' => 'nullable|date',
        'invoice_image' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
    ]);

    DB::beginTransaction();

    try {
        $userId = auth()->id() ?? 1;

        /* =============================
           UPDATE ITEM TABLE
        ============================== */
        $item->update([
            'item_name'     => $validated['item_name'],
            'part_number'   => $validated['part_number'] ?? $item->part_number,
            'category_id'   => $validated['category_id'] ?? null,
            'brand_id'      => $validated['brand_id'] ?? null,
            'branch_id'     => $validated['branch_id'] ?? null,
            'unit'          => $validated['unit'],
            'location'      => $validated['location'] ?? $item->location,
            'initial_stock' => $validated['initial_stock'] ?? $item->initial_stock,
            'low_stock'     => $validated['low_stock'] ?? $item->low_stock,
            'selling_price' => $validated['selling_price'] ?? $item->selling_price,
        ]);

        /* =============================
           IMAGE REPLACEMENT
        ============================== */
        if ($request->hasFile('images')) {

            $oldImages = is_string($item->images)
                ? json_decode($item->images, true)
                : $item->images;

            if (is_array($oldImages)) {
                foreach ($oldImages as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $paths = [];
            foreach ($request->file('images') as $image) {
                $paths[] = $image->store('items', 'public');
            }

            $item->images = json_encode($paths);
            $item->save();
        }

        /* =============================
           UPDATE / CREATE PURCHASE
        ============================== */
        if (!empty($validated['purchase_type'])) {

            $quantity = $validated['initial_stock'] ?? $item->initial_stock;
            $purchasePrice = $validated['purchase_price'] ?? 0;

            $purchase = Purchasee::updateOrCreate(
                ['item_code' => $item->item_code],
                [
                    'quantity' => $quantity,
                    'actual_unit_price' => $purchasePrice,
                    'actual_total_price' => $purchasePrice * $quantity,
                    'purchase_type' => $validated['purchase_type'],
                    'branch_id' => $validated['branch_id'],
                    'created_by' => $userId,
                ]
            );

            /* =============================
               HANDLE RECEIPT
            ============================== */
            if (
                $purchase->purchase_type === 'with_receipt' &&
                !empty($validated['purchase_receipt_price'])
            ) {

                $receiptUnitPrice  = $validated['purchase_receipt_price'];
                $receiptTotalPrice = $receiptUnitPrice * $quantity;
                $vatPaid = round($receiptTotalPrice * 0.15, 2);

                $receiptData = [
                    'receipt_unit_price'  => $receiptUnitPrice,
                    'receipt_total_price' => $receiptTotalPrice,
                    'vat_paid'            => $vatPaid,
                    'receipt_date'        => now(),
                    'branch_id'           => $validated['branch_id'],
                    'created_by'          => $userId,
                ];

                if (!empty($validated['invoice_number']))
                    $receiptData['invoice_number'] = $validated['invoice_number'];

                if (!empty($validated['invoice_date']))
                    $receiptData['invoice_date'] = $validated['invoice_date'];

                if ($request->hasFile('invoice_image')) {
                    $receiptData['invoice_image'] =
                        $request->file('invoice_image')->store('invoices', 'public');
                }

                $purchase->receipt()->updateOrCreate(
                    ['purchasee_id' => $purchase->id],
                    $receiptData
                );
            }
        }

        DB::commit();

        return response()->json([
            'message' => 'Item updated successfully',
            'item' => $item->fresh(['category', 'brand', 'branch']),
        ]);

    } catch (\Throwable $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Failed to update item',
            'error' => $e->getMessage(),
        ], 500);
    }
}



 public function availableItems(Request $request)
    {
        $items = Item::with(['brand', 'category', 'branch'])
            ->where('stock_status', 'available')
            ->get();

        return response()->json($items);
    }

    /**
     * Fetch all low stock items (stock_status = 'low_stock')
     */
    public function lowStockItems(Request $request)
    {
        $items = Item::with(['brand', 'category', 'branch'])
            ->where('stock_status', 'low_stock')
            ->get();

        return response()->json($items);
    }

    /**
     * Fetch all out-of-stock items (stock_status = 'out_of_stock')
     */
    public function outOfStockItems(Request $request)
    {
        $items = Item::with(['brand', 'category', 'branch'])
            ->where('stock_status', 'out_of_stock')
            ->get();

        return response()->json($items);
    }



public function destroy($item_code)
{
    try {
        $item = Item::where('item_code', $item_code)->firstOrFail();

        DB::transaction(function () use ($item) {

            /* 🔹 Delete images */
            $images = $item->images;
            if (is_string($images)) {
                $images = json_decode($images, true);
            }

            if (is_array($images)) {
                foreach ($images as $img) {
                    Storage::disk('public')->delete($img);
                }
            }

            /* 🔹 Delete QR code */
            if ($item->qr_code) {
                Storage::disk('public')->delete($item->qr_code);
            }

            /* 🔹 Delete relations */
            $item->receipts()->delete();
            $item->sales()->delete();
            $item->purchases()->delete();

            /* 🔹 Delete item */
            $item->delete();
        });

        return response()->json([
            'message' => 'Item deleted successfully',
            'item_code' => $item_code
        ]);

    } catch (\Throwable $e) {
        Log::error('Delete Item Error: '.$e->getMessage());

        return response()->json([
            'message' => 'Failed to delete item',
            'error' => $e->getMessage(),
        ], 500);
    }
}







public function import(Request $request)
{
    // 1️⃣ Validate request structure
    try {
        $request->validate([
            'items' => 'required|array|min:1',
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'message' => 'Invalid import payload',
            'errors'  => $e->errors(),
        ], 422);
    }

    $rows = $request->input('items');
    $userId = auth()->id() ?? 1;

    $inserted = 0;
    $updated  = 0;
    $rowErrors = [];

    DB::beginTransaction();

    try {
        // Get last numeric item_code once
        $lastCode = Item::orderBy('item_code', 'desc')->value('item_code');
        $newCodeInt = $lastCode ? (int) $lastCode : 0;

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // Excel row (assuming header row)

            try {
                // Normalize headers
                $normalized = [];
                foreach ($row as $key => $value) {
                    $normalized[strtolower(trim($key))] =
                        is_string($value) ? trim($value) : $value;
                }

                // Skip empty rows
                if (!array_filter($normalized)) {
                    continue;
                }

                // Required field: item_name
                $item_name = $normalized['item_name']
                    ?? $normalized['item name']
                    ?? null;

                if (!$item_name) {
                    throw new \Exception('Missing item_name');
                }

                // Quantities
                $quantity  = max(0, (int) ($normalized['quantity'] ?? 0));
                $low_stock = max(0, (int) ($normalized['minimum_stock'] ?? 0));

                // Part number
                $part_number = $normalized['part_number']
                    ?? $normalized['part no.']
                    ?? null;

                if (!$part_number) {
                    do {
                        $part_number = 'PN-' . strtoupper(Str::random(8));
                    } while (Item::where('part_number', $part_number)->exists());
                }

                // Brand
                $brand_id = null;
                if (!empty($normalized['brand'])) {
                    $brand_id = Brand::firstOrCreate([
                        'name' => trim($normalized['brand']),
                    ])->id;
                }

                // Category
                $category_id = null;
                if (!empty($normalized['category'])) {
                    $category_id = Category::firstOrCreate([
                        'name' => trim($normalized['category']),
                    ])->id;
                }

                // Branch
                $branchName = trim($normalized['branch'] ?? 'Main Branch');
                $branch_id = \App\Models\Branch::firstOrCreate([
                    'name' => $branchName,
                ])->id;

                // Prices
                $purchase_price = (float) ($normalized['purchasing_price'] ?? 0);
                $selling_price  = (float) ($normalized['selling_price'] ?? 0);

                // Defaults
                $unit     = $normalized['unit'] ?? 'Pcs';
                $location = $normalized['location'] ?? 'Warehouse';

                // Generate item_code
                $newCodeInt++;
                $item_code = str_pad($newCodeInt, 4, '0', STR_PAD_LEFT);

                // Create item
                $item = Item::create([
                    'item_code'     => $item_code,
                    'item_name'     => $item_name,
                    'part_number'   => $part_number,
                    'category_id'   => $category_id,
                    'brand_id'      => $brand_id,
                    'unit'          => $unit,
                    'location'      => $location,
                    'initial_stock' => $quantity,
                    'low_stock'     => $low_stock,
                    'branch_id'     => $branch_id,
                    'created_by'    => $userId,
                    'selling_price' => $selling_price,
                ]);

                // Images
                $images = [];
                if (!empty($normalized['images'])) {
                    foreach (explode(',', $normalized['images']) as $img) {
                        $img = trim($img);
                        if ($img) $images[] = 'items/' . $img;
                    }
                }
                $item->images = json_encode(
                    $images ?: ['items/default.jpg']
                );
                $item->save();

                // QR Code
                $qrDir = storage_path('app/public/qrcodes');
                if (!is_dir($qrDir)) {
                    mkdir($qrDir, 0755, true);
                }

                // $qrFile = "item_{$item->item_code}.svg";
                // QrCode::format('svg')
                //     ->size(300)
                //     ->generate($item->item_code, $qrDir . '/' . $qrFile);

                // $item->update([
                //     'qr_code' => 'qrcodes/' . $qrFile,
                // ]);

                // Initial purchase record
                Purchasee::create([
                    'item_code'          => $item->item_code,
                    'quantity'           => $quantity,
                    'actual_unit_price'  => $purchase_price,
                    'actual_total_price' => $purchase_price * $quantity,
                    'purchase_type'      => 'without_receipt',
                    'branch_id'          => $branch_id,
                    'created_by'         => $userId,
                ]);

                $inserted++;

            } catch (\Throwable $rowException) {
                // Collect row-level errors but continue import
                $rowErrors[] = [
                    'row'    => $rowNumber,
                    'error'  => $rowException->getMessage(),
                ];

                Log::warning('Import row failed', [
                    'row'   => $rowNumber,
                    'error' => $rowException->getMessage(),
                ]);
            }
        }

        DB::commit();

        return response()->json([
            'message'   => 'Import completed',
            'inserted'  => $inserted,
            'updated'   => $updated,
            'failed'    => count($rowErrors),
            'errors'    => $rowErrors,
        ], 200);

    } catch (\Throwable $e) {
        DB::rollBack();

        Log::error('Item import failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => 'Import failed due to server error',
        ], 500);
    }
}



public function search(Request $request)
{
    $q = $request->query('q');
    $branchId = $request->query('branch_id');

    if (!$q || !$branchId) {
        return response()->json([
            'items' => []
        ]);
    }

    $items = Item::with([
            'brand:id,name',
            'category:id,name',
            'branch:id,name',
            'creator:id,name',
            'purchases',
            'sales',
        ])
        ->where('branch_id', $branchId)
        ->where(function ($query) use ($q) {
            $query->where('item_code', 'LIKE', "%{$q}%")
                  ->orWhere('item_name', 'LIKE', "%{$q}%")
                  ->orWhere('part_number', 'LIKE', "%{$q}%");
        })
        ->orderBy('item_name')
        ->limit(20)
        ->get();

    return response()->json([
        'items' => $items
    ]);
}








public function scanCode(Request $request)
{
    $request->validate([
        'code' => 'required|string',
        'branch_id' => 'nullable|exists:branches,id',
    ]);

    $code     = trim($request->code);
    $branchId = $request->branch_id;

    $query = Item::with([
        'category:id,name',
        'brand:id,name',
        'branch:id,name',
        'purchases',
        'sales',
    ]);

    if ($branchId) {
        $query->where('branch_id', $branchId);
    }

    $item = $query->where(function ($q) use ($code) {
        $q->where('item_code', $code)
          ->orWhere('part_number', $code);
    })->first();

    if (! $item) {
        return response()->json([
            'message' => 'Item not found for scanned code',
            'code' => $code,
        ], 404);
    }

    return response()->json([
        'message' => 'Item detected successfully',
        'item' => $item,
        'qr_url' => $item->qr_code ? asset('storage/' . $item->qr_code) : null,
    ]);
}







//old code  change codes dow this to new code with item code



   



// Fetch a single item by item_code
public function show($itemCode)
{
    $item = Item::where('item_code', $itemCode)
                ->with(['category', 'brand', 'branch', 'purchases', 'sales'])
                ->first();

    if (!$item) {
        return response()->json([
            'message' => 'Item not found',
            'item_code' => $itemCode
        ], 404);
    }

    return response()->json($item);
}

// Fetch multiple items by array of item_codes
public function fetchSelectedItems(Request $request)
{
    $validated = $request->validate([
        'codes' => 'required|array',
        'codes.*' => 'string|exists:items,item_code',
    ]);

    $items = Item::whereIn('item_code', $validated['codes'])
                 ->with(['category', 'brand', 'branch', 'purchases', 'sales'])
                 ->get();

    return response()->json([
        'message' => 'Items fetched successfully',
        'items' => $items,
    ]);
}







public function bulkToggleEcommerce(Request $request)
{
    $request->validate([
        'items' => 'required|array',
        'items.*.item_code' => 'required|string',
        'items.*.posted' => 'required|boolean',
    ]);

    foreach ($request->items as $item) {
        Item::where('item_code', $item['item_code'])
            ->update(['posted_to_ecommerce' => $item['posted']]);
    }

    return response()->json([
        'message' => 'Items updated successfully'
    ]);
}


public function ecommerceIndex()
{
    return Item::with(['category', 'brand'])
        ->where('posted_to_ecommerce', true)
        ->orWhereNotNull('posted_to_ecommerce')
        ->get();
}
public function addToEcommerce(Request $request)
{
    $request->validate([
        'item_codes' => 'required|array',
    ]);

    Item::whereIn('item_code', $request->item_codes)
        ->update([
            // DO NOT force true
            'posted_to_ecommerce' => DB::raw('posted_to_ecommerce')
        ]);

    return response()->json([
        'message' => 'Items added to ecommerce manager'
    ]);
}


public function toggleEcommerce(Request $request)
{
    $request->validate([
        'item_code' => 'required|string',
        'posted' => 'required|boolean',
    ]);

    $item = Item::where('item_code', $request->item_code)->firstOrFail();
    $item->posted_to_ecommerce = $request->posted;
    $item->save();

    return response()->json([
        'message' => 'Ecommerce status updated',
        'posted_to_ecommerce' => $item->posted_to_ecommerce
    ]);
}



    public function getOutOfStockItems()
    {
        $items = Item::where('quantity', 0)->get();

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
        $itemsOut = Item::where('quantity', '=', 0)->get();

        return response()->json($itemsOut, 200);
    }

public function dashboardStats()
{
    return response()->json([
        'total_items'    => Item::count(),
        'total_quantity' => Item::sum('initial_stock'),
        'out_of_stock'   => Item::where('stock_status', 'out_of_stock')->count(),
        'low_stock'      => Item::where('stock_status', 'low_stock')->count(),
        'available'      => Item::where('stock_status', 'available')->count(),
    ]);
}



// public function dashboardStats()
// {
//     $totalItems = Item::count();
//     $totalQuantity = Item::sum('quantity');

//     // Out of stock
//     $outOfStock = Item::where('quantity', 0)->count();

//     // Low stock based on each item's threshold
//     $lowStock = Item::whereColumn('quantity', '<=', 'low_stock')
//         ->whereNotNull('low_stock')
//         ->count();

//     // Below initial stock (stock reduced)
//     $belowInitial = Item::whereColumn('quantity', '<', 'initial_stock')->count();

//     // Healthy stock (equal or above initial)
//     $healthyStock = Item::whereColumn('quantity', '>=', 'initial_stock')->count();

//     return response()->json([
//         'total_items'     => $totalItems,
//         'total_quantity'  => $totalQuantity,
//         'out_of_stock'    => $outOfStock,
//         'low_stock'       => $lowStock,
//         'below_initial'   => $belowInitial,
//         'healthy_stock'   => $healthyStock,
//     ]);
// }








}
