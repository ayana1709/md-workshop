<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
   protected $fillable = [
    'date',
    'name',
    'reference',
    'fs',
    'mobile',
    'tin',
    'vat',
    'method',
    'status',
    'paidAmount',
    'remainingAmount',
    'paidBy',
    'approvedBy',
    'reason',
    'remarks',
    'fromBank',
    'toBank',
    'otherFromBank',
    'otherToBank',
    'chequeNumber',
    'image',
    'labourCosts',
    'spareCosts',
    'otherCosts',
    'summary',
];


    protected $casts = [
        'date'          => 'date',
        'paidAmount'    => 'decimal:2',
        'remainingAmount' => 'decimal:2',
        'labourCosts'   => 'array',
        'spareCosts'    => 'array',
        'otherCosts'    => 'array',
        'summary'       => 'array',
    ];
}
