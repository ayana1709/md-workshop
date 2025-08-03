<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareChange extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_card_no',
        'plate_number',
        'customer_name',
        'repair_category',
        'spare_change', 
    
    ];

    protected $casts = [
        'spare_change' => 'array', // ✅ Automatically convert JSON to array
        'repair_category' => 'array',
    ];
}
