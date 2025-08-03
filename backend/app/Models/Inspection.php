<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    use HasFactory;
    protected $fillable = [
    'job_id', // Add job_id to fillable
    'customer_name',
    'customer_type',
    'phone_number',
    'tin_number',
    'result',
    'total_payment',
    'checked_by',
    'plate_number',
    'make',
    'model',
    'year',
    ];
    protected $casts = [

        'vehicle_conditions' =>'array',
    ];
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    protected static function boot()
    {
        parent::boot();
    
        static::creating(function ($repair) {
            $latestJob = static::orderBy('job_id', 'desc')->first();
            $newJobId = $latestJob ? (int) $latestJob->job_id + 1 : 1;
    
            // Format with leading zeros (adjust 4 to your desired length)
            $repair->job_id = str_pad($newJobId, 4, '0', STR_PAD_LEFT);
        });
    }
}


