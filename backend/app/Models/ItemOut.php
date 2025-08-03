<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemOut extends Model {
    use HasFactory;

    protected $table = 'item_out'; // Specify table name

    protected $fillable = [
        'item_id',
        'part_number',
        'description',
        'brand',
        'model',
        'condition',
        'quantity',
        'unit_price',
        'total_price',
        'location',
        'date',
    ];

    // Define the relationship with the Item model
    public function item() {
        return $this->belongsTo(Item::class);
    }
}

