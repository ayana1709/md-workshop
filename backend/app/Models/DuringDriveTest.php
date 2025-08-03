<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DuringDriveTest extends Model
{
    use HasFactory;
    protected $fillable = [
        'job_card_no', 'plate_number', 'customer_name', 'checked_by', 'work_details'
    ];

    protected $casts = [
        'work_details' => 'array',
    ];
}
