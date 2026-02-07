<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchasee extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'quantity',
        'unit_price',
        'total_price',
        'purchase_type',
        'receipt_price',
        'supplier_name',
        'receipt_number',
        'branch_id',
        'created_by',
    ];

    /* ============ RELATIONS ============ */

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_code');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
