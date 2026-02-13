<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salee extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_type',
        'subtotal',
        'vat_amount',
        'grand_total',
        'branch_id',
        'created_by',
        'customer_id',
    ];

   

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function receipt()
    {
        return $this->hasOne(SaleReceipt::class, 'salee_id');
    }

    public function payments()
    {
        return $this->hasMany(Paymentt::class, 'sale_id');
    }
    public function items() {
    return $this->hasMany(SaleItem::class, 'sale_id');
}

}
