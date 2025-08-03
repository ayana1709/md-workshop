<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'customer_name',
        'customer_type',
        'mobile',
        'types_of_jobs',
        'received_date',
        'estimated_date',
        'promise_date',
        'priority',
        'product_name',
        'serial_code',
        'customer_observation',
        'spare_change',
        'job_description',
        'received_by',
        'status',
        'image',
    ];

    protected $casts = [
        'customer_observation' => 'array',
        'spare_change' => 'array',
        'job_description' => 'array',
    ];

    // Auto-generate job_id
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($repair) {
            $latestJob = static::orderBy('job_id', 'desc')->first();
            $newJobId = $latestJob ? (int) $latestJob->job_id + 1 : 1;

            $repair->job_id = str_pad($newJobId, 4, '0', STR_PAD_LEFT);
        });
    }
}
