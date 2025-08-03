<?php

// app/Models/ProformaItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProformaItem extends Model
{
    protected $fillable = [
        'proforma_id', 'description', 'quantity',
        'material_cost', 'labor_cost', 'total_cost'
    ];

    public function proforma()
    {
        return $this->belongsTo(Proforma::class);
    }
}
