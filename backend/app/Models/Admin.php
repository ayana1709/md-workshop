<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable;

    protected $table = 'admins';
    protected $guard_name = 'web';

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'status',
        'level',
        'profile_image',
        'branch_id', // updated from department_id
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // User belongs to a branch
  

    public function branch()
{
    return $this->belongsTo(Branch::class, 'branch_id');
}

    // Check if admin is super/admin
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('admin'); // adjust role name if different
    }
}
