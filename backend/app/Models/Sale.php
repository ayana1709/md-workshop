<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_date',
        'customer_name',
        'company_name',
        'tin_number',
        'vat_rate',
        'discount',
        'due_amount',
        'paid_amount',
        'total_amount',
        'sub_total',
        'mobile',
        'office',
        'phone',
        'website',
        'email',
        'address',
        'bank_account',
        'payment_status',
        'payment_type',
        'remark',
        'other_info',
    ];

    public function items()
    {
        return $this->belongsToMany(Item::class, 'sale_items')
                    ->withPivot(['item_name', 'part_number', 'brand', 'unit', 'unit_price', 'sale_quantity'])
                    ->withTimestamps();
    }
}
