<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'proforma_id', 'description', 'unit', 'brand', 'qty', 'unit_price', 'total'
    ];

    public function proforma()
    {
        return $this->belongsTo(Proforma::class);
    }
}
