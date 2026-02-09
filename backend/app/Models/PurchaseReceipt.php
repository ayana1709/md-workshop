<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchasee_id',
        'receipt_unit_price',
        'receipt_total_price',
        'vat_paid', // new column
        'receipt_date',
        'branch_id',
        'created_by',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchasee::class, 'purchasee_id');
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
