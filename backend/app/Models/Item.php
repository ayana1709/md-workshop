<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model {
    use HasFactory;

    protected $fillable = [
        'description',
        'part_number',
        'quantity',
        'brand',
        'model',
        'unit_price',
        'total_price',
        'location',
        'condition',
        'item_name',
        'unit',
        'purchase_price',
        'selling_price',
        'least_price',
        'maximum_price',
        'minimum_quantity',
        'low_quantity',
        'manufacturer',
        'manufacturing_date',
    ];
    
}

