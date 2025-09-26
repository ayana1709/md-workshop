<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;


class Admin extends Authenticatable
{

  

    use HasApiTokens, Notifiable, HasRoles;
    
    protected $fillable = ['name', 'username', 'email', 'password'];
    protected $hidden = ['password'];
    protected $guarded = [];
      protected $guard_name = 'web';
}


