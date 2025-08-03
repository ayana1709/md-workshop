<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WheelAlignemnt extends Model
{
    use HasFactory;
    protected $fillable = [
        'job_id', // Add job_id to fillable
        'job_card_no',
        'date',
        'customer_name',
        'customer_type',
        'mobile',
        'tin_number',
        'checked_date',
        'work_description',
        'result',
        'total_amount',
        'professional',
        'checked_by',
    ];
// Define the relationship with the Customer model
public function customer()
{
    return $this->belongsTo(Customer::class);
}
public function employee()
    {
        return $this->belongsTo(Employee::class);

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
