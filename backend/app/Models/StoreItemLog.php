<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreItemLog extends Model {
    use HasFactory;

    protected $fillable = [
        'code',
        'old_quantity',
        'new_quantity',
        'change_amount',
        'old_values',  // Store old data before update
        'new_values',  // Store new updated data
        'changed_fields', // Track which fields changed
        'user_id'
    ];

    protected $casts = [
        'old_values' => 'array', // Convert JSON to array
        'new_values' => 'array', // Convert JSON to array
    ];
}

