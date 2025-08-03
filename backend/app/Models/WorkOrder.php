<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    use HasFactory;

    protected $fillable = ['job_card_no', 'plate_number', 'customer_name', 'repair_category', 'work_details'];

    protected $casts = [
        'work_details' => 'array',
        'repair_category' => 'array',
        
        
        // Automatically convert JSON to array
    ];
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

   
    
    public function workDetails()
{
    return $this->hasMany(WorkDetail::class);
}

    
}
