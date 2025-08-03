<?php

// app/Models/StoreItem.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'description', 'partNumber', 'quantity', 'brand', 'model', 'condition', 'unitPrice', 'totalPrice', 'location'
    ];
    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}