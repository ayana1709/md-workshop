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
        'actual_unit_price',
        'actual_total_price',
        'sale_type',
        'branch_id',
        'created_by',
        'customer_id', // link customer if any
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_code', 'item_code');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function receipt()
    {
        return $this->hasOne(SaleReceipt::class, 'salee_id');
    }

    public function payments()
    {
        return $this->hasMany(Paymentt::class, 'sale_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
    public function creator()
{
    return $this->belongsTo(Admin::class, 'created_by');
}

}
