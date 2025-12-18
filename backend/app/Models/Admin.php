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
        'department_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
