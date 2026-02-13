<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'item_code',
        'quantity',
        'unit_price',
        'total_price',
        'vat_percent',
    ];

  public function item()
{
    return $this->belongsTo(Item::class, 'item_code', 'item_code');
}

public function sale()
{
    return $this->belongsTo(Salee::class, 'sale_id');
}
}
