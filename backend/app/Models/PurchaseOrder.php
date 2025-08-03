<?php

// app/Models/PurchaseOrder.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'sales_date', 'supplier_name', 'company_name', "reference_number", 'tin_number',
        'mobile', 'office', 'phone', 'website', 'email', 'address',
        'bank_account', 'other_info', 'remark'
    ];

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
