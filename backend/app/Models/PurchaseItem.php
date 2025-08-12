<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id', 'code', 'item_name', 'part_number',
        'quantity', 'brand', 'model', 'unit_price', 'total_price', 'location', 'condition'
    ];
    

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
    public function storeItem()
    {
        return $this->belongsTo(StoreItem::class);
    }
}

