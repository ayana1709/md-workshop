<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'contact_information',
        'position',
        'address',
        'gender',
    ];

    // Define the relationship with the WheelAlignment model
    public function WheelAlignment()
    {
        return $this->hasMany(WheelAlignemnt::class);
    }
}
