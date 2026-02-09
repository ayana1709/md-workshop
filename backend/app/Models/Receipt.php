<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',

        'receipt_unit_price',
        'receipt_total_price',

        'receipt_number',
        'receipt_image',
        'receipt_date',

        'branch_id',
        'created_by',
    ];

    public function receiptable()
    {
        return $this->morphTo();
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_code');
    }
}

