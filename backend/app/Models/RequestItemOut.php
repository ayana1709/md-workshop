<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestItemOut extends Model {
    use HasFactory;
    protected $table = 'request_item_out'; // ✅ Tell Laravel the correct table name

    protected $fillable = [
        'job_card_no', 'plate_number', 'customer_name', 'part_number',
        'description', 'brand', 'model', 'request_quantity','requested_by', 'unit_price',
        'total_price', 'location', 'status'
    ];
}
