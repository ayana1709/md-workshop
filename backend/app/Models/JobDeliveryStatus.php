<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobDeliveryStatus extends Model
{
    use HasFactory;

    protected $table = 'job_delivery_statuses';

    protected $fillable = [
        'job_id',
        'driver_status',
        'checked_by',
        'approved_by',
        'received_date',
    ];

    // If job_id is not an integer, disable incrementing and set primary key
    protected $primaryKey = 'job_id';
    public $incrementing = false;
    protected $keyType = 'string';
}
