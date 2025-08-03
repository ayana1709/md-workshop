<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostDriveTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_card_no',
        'customer_name',
        'plate_number',
        'checked_by',
        'checked_date',
        'post_test_observation',
        'recommendation',
        'technician_final_approval',
    ];
}
