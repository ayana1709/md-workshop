<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConditionOfVehicle extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'customer_id',
        'plate_number',
        // Dynamically adding condition fields
        ...self::generateConditionFields(),
    ];

    /**
     * Dynamically generate condition field names.
     *
     * @return array
     */
    private static function generateConditionFields()
    {
        return array_map(fn ($i) => "condition_field_$i", range(1, 37));
    }

    /**
     * Define a one-to-one relationship with the TypeOfJob model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function typeOfJob()
    {
        return $this->hasOne(TypeOfJob::class);
    }

    /**
     * Define a relationship with the Customer model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
