<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'workDescription',
        'laborTime',
        'cost',
        'total',
        'startDate',
        'endDate',
        'status',
    ];


    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }
    
}
