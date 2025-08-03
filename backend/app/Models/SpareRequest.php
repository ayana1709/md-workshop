<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_card_no',
        'plate_number',
        'customer_name',
        'repair_category',
        'sparedetails', // ✅ Contains part_number, requested_quantity, unit_price, and status
        'level',
        'status', // ✅ Overall status of the request
        'item_id', // ✅ Foreign key linking to items table
    ];

    protected $casts = [
        'sparedetails' => 'array', // ✅ Automatically convert JSON to array
        'repair_category' => 'array',
    ];

    // ✅ Relationship with the `items` table
    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
