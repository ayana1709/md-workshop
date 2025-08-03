<?php

// app/Models/CarInspection.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'condition_of_vehicle_id',
        'R_Order',
        'Front',
        'Rear',
        'Left_Side',
        'Right_Side',
        'Door',
        'Interior',
        'Tools',
      
    ];

    public function conditionOfVehicle()
    {
        return $this->belongsTo(ConditionOfVehicle::class);
    }
}
