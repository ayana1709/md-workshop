<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable, HasRoles;

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
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
