<?php


// app/Models/Proforma.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proforma extends Model
{
    protected $fillable = [
        'job_id', 'date', 'customer_name', 'product_name', 'types_of_jobs',
         'prepared_by', 'delivery_time', 'notes', 'net_total'
    ];
    public function items()
    {
        return $this->hasMany(ProformaItem::class);
    }
}
