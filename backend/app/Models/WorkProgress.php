<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkProgress extends Model
{
    use HasFactory;

    protected $table = 'work_progress';

    protected $fillable = [
        'job_card_no',
        'plate_number',
        'customer_name',
        'repair_category',
        'work_description',
        'assigned_to',
        'time_in',
        'time_out',
        'status',
        'progress',
        'remark',
    ];
}
