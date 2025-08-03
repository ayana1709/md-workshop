<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'repair_registration_id',
        'job_id',
        'customer_name',
        'plate_number',
        'payment_method',
        'payment_status',
        'paid_amount',
        'remaining_amount',
        'ref_no',
        'payment_date',
        'paid_by',
        'approved_by',
        'reason',
        'remark',
        'from_bank',     // ✅ newly added
        'to_bank',       // ✅ newly added
    ];

    public function repairRegistration()
    {
        return $this->belongsTo(RepairRegistration::class);
    }
}
