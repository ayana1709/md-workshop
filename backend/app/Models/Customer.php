<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
        'name', 
        'customerType',
        'telephone',
        'carModels',
    ];
    
    protected $casts = [
        'carModels' => 'array', 
    ];
    
    
    
     // Define the relationship with the Vehicle model
     public function vehicles()
     {
         return $this->hasMany(Vehicle::class);
     }
     public function Bolo()
     {
         return $this->hasMany(Bolo::class);
     }
     public function  Inspection()
     {
         return $this->hasMany(Inspection::class);
     }
     
    
}
