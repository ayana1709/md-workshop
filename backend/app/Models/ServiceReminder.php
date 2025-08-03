<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceReminder extends Model
{
    protected $fillable = [
        'job_card_id',
        'customer_name',
        'plate_number',
        'reminders',
        'approved_by',
    ];

    protected $casts = [
        'reminders' => 'array',
    ];
}
