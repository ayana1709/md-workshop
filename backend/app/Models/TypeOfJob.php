<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class TypeOfJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'condition_of_vehicle_id',
        'Customer_Observation',
        'Job_to_be_Done',
        'Additional_Work',
    ];

    public function conditionOfVehicle()
    {
        return $this->belongsTo(ConditionOfVehicle::class);
    }
}
