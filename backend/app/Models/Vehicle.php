<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_registration_id', 'plate_no', 'model','vin', 'condition',
        'tin', 'year', 'km_reading', 'estimated_price'
    ];

    public function repairRegistration()
    {
        return $this->belongsTo(RepairRegistration::class, 'repair_registration_id');
    }
}

