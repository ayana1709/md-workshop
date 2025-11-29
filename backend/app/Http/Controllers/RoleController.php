<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    // List all roles
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    // Store a new role
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'description' => 'nullable|string',
            'priority' => 'nullable|integer',
            'status' => 'required|in:Active,Inactive',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => $request->status,
        ]);

        // Assign permissions if sent
        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json($role, 201);
    }

    // Show a role with permissions
    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    // Update a role
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'name' => 'required|unique:roles,name,' . $id,
            'description' => 'nullable|string',
            'priority' => 'nullable|integer',
            'status' => 'required|in:Active,Inactive',
        ]);

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => $request->status,
        ]);

        // Update permissions
        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json($role);
    }

    // Delete a role
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }

    // List all permissions
    public function permissions()
    {
        $permissions = Permission::all();
        return response()->json($permissions);
    }
    // PermissionController.php
public function getByRole($roleId)
{
    $permissions = Permission::where('role_id', $roleId)->get();
    return response()->json($permissions);
}

}
