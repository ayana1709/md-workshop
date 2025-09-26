<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * List all users.
     */
    public function index()
    {
        $users = Admin::with('roles')->get();
        return response()->json($users);
    }

    /**
     * Show a single user by ID.
     */
    public function show($id)
    {
        $user = Admin::with('roles')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:admins,username',
            'email' => 'required|email|unique:admins,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
            'level' => 'nullable|integer|min:1',
        ]);

        $user = Admin::create([
            'name' => $request->full_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'status' => $request->status ?? 'active',
            'level' => $request->level,
        ]);

        $user->assignRole($request->role);

        return response()->json(['message' => 'User created successfully', 'user' => $user]);
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, $id)
    {
        $user = Admin::findOrFail($id);

        $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => "required|string|max:255|unique:admins,username,{$user->id}",
            'email' => "required|email|unique:admins,email,{$user->id}",
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|exists:roles,name',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
            'level' => 'nullable|integer|min:1',
        ]);

        $user->update([
            'name' => $request->full_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
            'phone' => $request->phone,
            'status' => $request->status ?? $user->status,
            'level' => $request->level ?? $user->level,
        ]);

        // Sync role
        $user->syncRoles([$request->role]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Delete a user.
     */
    public function destroy($id)
    {
        $user = Admin::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = Admin::findOrFail($id);
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
