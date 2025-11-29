<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proforma extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id', 'date', 'customer_name', 'customer_tin',
        'status',  'prepared_by', 'delivery_date',
        'ref_num', 'validity_date', 'notes','paymenttype','payment_before',
        'discount', 'other_cost', 'labour_vat', 'spare_vat',
        'total', 'total_vat', 'gross_total',
        'net_pay', 'net_pay_in_words'
    ];

    public function labourItems()
    {
        return $this->hasMany(LabourItem::class);
    }

    public function spareItems()
    {
        return $this->hasMany(SpareItem::class);
    }
}
