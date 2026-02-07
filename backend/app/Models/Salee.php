<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salee extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'quantity',
        'unit_price',
        'total_price',
        'invoice_number',
        'sale_type',
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

    public function seller()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
