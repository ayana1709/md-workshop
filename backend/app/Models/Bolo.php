<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bolo extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id', // Add job_id to fillable
        'job_card_no', 'customer_name', 'customer_type', 'mobile', 'tin_number',
        'checked_date', 'issue_date', 'expiry_date', 'next_reminder', 'result',
        'plate_number', 'vehicle_type', 'model', 'tin', 'year', 'condition',
        'km_reading', 'professional', 'payment_total'
    ];
    

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id'); // Assuming employee is stored in the users table
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
