<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchasee extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'quantity',

        // REAL prices
        'actual_unit_price',
        'actual_total_price',

        'purchase_type',
        'supplier_name',
        'branch_id',
        'created_by',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_code');
    }

    public function receipt()
    {
        return $this->morphOne(Receipt::class, 'receiptable');
    }



    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
