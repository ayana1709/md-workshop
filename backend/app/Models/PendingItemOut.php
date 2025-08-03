<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingItemOut extends Model {
    use HasFactory;

    protected $table = 'pending_item_out';

    protected $fillable = [
        'job_card_no',
        'plate_number',
        'customer_name',
        'part_number',
        'description',
        'brand',
        'model',
        'request_quantity',
        'unit_price',
        'total_price',
        'status',
    ];
}

