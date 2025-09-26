<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    // Allow mass assignment for custom fields
    protected $fillable = [
        'name',        // already required by Spatie
        'guard_name',  // usually 'web'
        'description',
        'priority',
        'status',
    ];
}
