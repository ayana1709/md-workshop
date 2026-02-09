<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'salee_id',
        'receipt_unit_price',
        'receipt_total_price',
        'vat_collected', // new column
        'receipt_date',
        'customer_name',
        'customer_phone',
        'payment_type',
        'paid_amount',
        'branch_id',
        'created_by',
    ];

    public function sale()
    {
        return $this->belongsTo(Salee::class, 'salee_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    public function customer()
{
    return $this->belongsTo(Customer::class, 'customer_id');
}

}
