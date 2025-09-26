<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabourItem extends Model
{
    use HasFactory;

    // Define the table name (optional if it's the plural of the model name)
    protected $table = 'labour_items';

    // Define the fillable columns to protect against mass assignment vulnerabilities
    protected $fillable = [
        'proforma_id', // Relationship to Proforma
        'description',  // Work description
        'unit',         // Unit of measurement (e.g., hr, job)
        'cost',         // Cost per unit
        'est_time',     // Estimated time (e.g., hours, days)
        'total',        // Total for this row (cost * est_time)
        'remark',
    ];

    // Define the relationship to Proforma
    public function proforma()
    {
        return $this->belongsTo(Proforma::class);
    }
}
