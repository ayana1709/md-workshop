<?php

// app/Models/RolePermission.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $fillable = [
        'role_id',
        'feature_name',
        'can_create',
        'can_manage',
        'can_edit',
        'can_delete',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}

