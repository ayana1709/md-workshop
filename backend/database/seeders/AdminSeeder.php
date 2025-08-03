<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    public function run()
    {
        if (!Admin::where('username', 'admin')->exists()) { // Avoid duplicate admin creation
            Admin::create([
                'name' => 'admin',
                'username' => 'admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('admin'), // Ensure password hashing
            ]);
        }
    }
}
