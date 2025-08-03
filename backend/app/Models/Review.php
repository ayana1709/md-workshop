<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'condition_of_vehicle_id', // Foreign key linking to ConditionOfVehicle
        'labour1',
        'labour2',
        'labour3',
        'labour4',
        'spare1',
        'spare2',
        'spare3',
        'spare4',
        'km',
        'price_estimation',
        'full_name',
        'customer_signature',
        'receptionist_signature', // Corrected typo for consistency
    ];

    /**
     * Define a relationship to the ConditionOfVehicle model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function conditionOfVehicle()
    {
        return $this->belongsTo(ConditionOfVehicle::class);
    }
}
