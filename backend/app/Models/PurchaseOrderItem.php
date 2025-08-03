<?php

// app/Models/PurchaseOrderItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id', 'item_id', 'description',
        'part_number', 'brand', 'unit', 'unit_price', 'sale_quantity'
    ];

    public function order()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
