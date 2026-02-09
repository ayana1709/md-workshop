<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salee extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'quantity',

        // REAL prices
        'actual_unit_price',
        'actual_total_price',

        'sale_type',
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
    }    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

}



