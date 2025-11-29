<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
            'permissions' => 'sometimes|array', // optional for admin
        ]);

        $role = Role::where('name', $request->role)->firstOrFail();

        // Admin → give all permissions automatically
        if ($role->name === 'admin') {
            $features = [
                "Job Order", "Work Order", "Inventory", "Payment", "Sales",
                "Purchase", "Proforma", "Checklist", "Setting",
                "Staff Management", "Income", "Expense",
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

            return response()->json(['message' => 'Admin granted all permissions automatically']);
        }

        // Other roles → clear old permissions first
        RolePermission::where('role_id', $role->id)->delete();

        // Save submitted permissions
        foreach ($request->permissions as $feature => $actions) {
            RolePermission::create([
                'role_id' => $role->id,
                'feature_name' => $feature,
                'can_create' => !empty($actions['create']),
                'can_manage' => !empty($actions['manage']),
                'can_edit' => !empty($actions['edit']),
                'can_delete' => !empty($actions['delete']),
            ]);
        }

        return response()->json(['message' => 'Permissions updated successfully']);
    }

    public function index()
    {
        return RolePermission::with('role')->get();
    }

    /**
     * Delete ALL permissions by role_id instead of single id
     */
    public function destroy($roleId)
    {
        RolePermission::where('role_id', $roleId)->delete();
        return response()->json(['message' => 'All permissions deleted for this role']);
    }

    /**
     * Get permissions by role_id
     */
    public function getByRole($roleId)
    {
        $permissions = RolePermission::where('role_id', $roleId)->get();
        return response()->json($permissions);
    }
    /**
 * Update permissions by role_id
 */
public function updateByRole(Request $request, $roleId)
{
    $request->validate([
        'permissions' => 'required|array',
    ]);

    $role = Role::findOrFail($roleId);

    // Admin → automatically give all permissions
    if ($role->name === 'admin') {
        $features = [
            "Job Order", "Work Order", "Inventory", "Payment", "Sales",
            "Purchase", "Proforma", "Checklist", "Setting",
            "Staff Management", "Income", "Expense",
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

        return response()->json(['message' => 'Admin granted all permissions automatically']);
    }

    // Update each feature permission or create if doesn't exist
    foreach ($request->permissions as $feature => $actions) {
        RolePermission::updateOrCreate(
            ['role_id' => $role->id, 'feature_name' => $feature],
            [
                'can_create' => !empty($actions['create']),
                'can_manage' => !empty($actions['manage']),
                'can_edit' => !empty($actions['edit']),
                'can_delete' => !empty($actions['delete']),
            ]
        );
    }

    return response()->json(['message' => 'Permissions updated successfully']);
}

}
