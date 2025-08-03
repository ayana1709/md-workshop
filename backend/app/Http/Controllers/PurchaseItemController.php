<?php

namespace App\Http\Controllers;

use App\Models\PurchaseItem;
use Illuminate\Http\Request;

class PurchaseItemController extends Controller
{
    public function index()
    {
        $items = PurchaseItem::all(); // Fetch all purchase items
        return response()->json($items, 200);
    }
}
