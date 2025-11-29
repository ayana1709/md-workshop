<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'category',
        'amount',
        'payment_method',
        'reference_no',
        'paid_by',
        'approved_by',
        'remarks',
        'staff_name',
        'hours',
        'rate',
        'service_provider',
        'service_type',
        'job_id',
        'utility_type',
        'billing_period',
        'account_no',
        'vendor_name',
        'contract_no',
        'beneficiary',
    ];

    public function job()
    {
        return $this->belongsTo(\App\Models\RepairRegistration::class, 'job_id');
    }
}
