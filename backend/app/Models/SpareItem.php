<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpareItem extends Model
{
    use HasFactory;

    // Define the table name (optional if it's the plural of the model name)
    protected $table = 'spare_items';

    // Define the fillable columns to protect against mass assignment vulnerabilities
    protected $fillable = [
        'proforma_id', // Relationship to Proforma
        'description',  // Spare part description
        'unit',         // Unit of measurement (e.g., pcs, set)
        'brand',        // Brand of the spare part
        'qty',          // Quantity of spare parts
        'unit_price',   // Price per unit
        'total',        // Total for this row (qty * unit_price)
       'remark',
    ];

    // Define the relationship to Proforma
    public function proforma()
    {
        return $this->belongsTo(Proforma::class);
    }
}
