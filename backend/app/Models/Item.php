<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'part_number',
        'brand',
        'type',
        'quantity',
        'unit',
        'purchase_price',
        'selling_price',
        'least_price',
        'maximum_price',
        'minimum_quantity',
        'low_quantity',
        'manufacturer',
        'shelf_number',
        'manufacturing_date',
        'unit_price',
        'total_price',
        'location',
        'condition',
        'image', // ✅ new
    ];
}
