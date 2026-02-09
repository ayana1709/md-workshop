<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone',
        'address',
        'email',
        'notes',
        'status',
    ];

    // Relationship with sales
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
