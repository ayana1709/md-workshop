<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function admins()
    {
        return $this->hasMany(Admin::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class, 'branch_id');
    }
}
