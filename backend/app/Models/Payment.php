<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'jobId',          // camelCase
        'name',
        'mobile',
        'plate',
        'model',
        'priority',
        'receivedDate',
        'dateOut',
        'method',
        'status',
        'paidAmount',
        'remainingAmount',
        'reference',
        'date',
        'paidBy',
        'approvedBy',
        'reason',
        'remarks',
        'labourCosts',
        'spareCosts',
        'otherCosts',
        'summary',
    ];

    protected $casts = [
        'labourCosts' => 'array',
        'spareCosts'  => 'array',
        'otherCosts'  => 'array',
        'summary'     => 'array',
    ];
}
