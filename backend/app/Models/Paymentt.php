<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paymentt extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'amount',
        'payment_method',
        'payment_reference',
        'paid_at',
        'notes',
    ];

    // Relationship with sale
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
