<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'tasks',
        'spares',
        'other_cost',
        'total_cost',
        'labour_status',
        'status',
        'progress',
    ];

    protected $casts = [
        'tasks'  => 'array',
        'spares' => 'array',
    ];

    public function repair()
    {
        return $this->belongsTo(RepairRegistration::class, 'job_id', 'job_id');
    }
}
