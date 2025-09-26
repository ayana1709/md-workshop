<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\RolePermission;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Create "admin" role if it doesn't exist
        $role = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web']
        );

        // Check if default admin user already exists
        if (!Admin::where('username', 'admin')->exists()) {
            $admin = Admin::create([
                'name' => 'Super Admin',
                'username' => 'admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('admin'), // default password
            ]);

            // Assign role to user
            $admin->assignRole($role);

            echo "✅ Admin user created with role 'admin' \n";
        } else {
            echo "ℹ️ Admin user already exists \n";
        }

        // Assign full permissions to admin role
        $features = [
            "Job Order",
            "Work Order",
            "Inventory",
            "Payment",
            "Sales",
            "Purchase",
            "Proforma",
            "Checklist",
            "Setting",
            "Staff Management",
            "Income",
            "Expense",
        ];

        foreach ($features as $feature) {
            RolePermission::updateOrCreate(
                ['role_id' => $role->id, 'feature_name' => $feature],
                [
                    'can_create' => true,
                    'can_manage' => true,
                    'can_edit' => true,
                    'can_delete' => true,
                ]
            );
        }

        echo "✅ Admin role granted all permissions automatically \n";
    }
}
