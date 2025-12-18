<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * List all users.
     */
    public function index()
    {
        $users = Admin::with(['roles', 'department'])->get();

        return response()->json($users);
    }

    /**
     * Show a single user by ID.
     */
    public function show($id)
    {
        $user = Admin::with('roles', 'department')->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Create a new user with image.
     */
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:admins,username',
            'email' => 'required|email|unique:admins,email',
            'password' => 'required|string|min:4',
            'role' => 'required|string|exists:roles,name',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
            'level' => 'nullable|integer|min:1',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png',
            'department_id' => 'required|exists:departments,id',
        ]);

        $imageName = null;
        if ($request->hasFile('profile_image')) {
            $imageName = time() . '_' . $request->profile_image->getClientOriginalName();
            $request->profile_image->storeAs('profile_images', $imageName, 'public');
        }

        $user = Admin::create([
            'name' => $request->full_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'status' => $request->status ?? 'active',
            'level' => $request->level,
            'profile_image' => $imageName,
            'department_id' => $request->department_id,
        ]);

        $user->assignRole($request->role);

        return response()->json(['message' => 'User created successfully', 'user' => $user]);
    }

    /**
     * Update an existing user with image replacement.
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
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png',
            'department_id' => 'required|exists:departments,id',
        ]);

        // Handle Image Change
        if ($request->hasFile('profile_image')) {
            if ($user->profile_image && Storage::disk('public')->exists('profile_images/' . $user->profile_image)) {
                Storage::disk('public')->delete('profile_images/' . $user->profile_image);
            }

            $imageName = time() . '_' . $request->profile_image->getClientOriginalName();
            $request->profile_image->storeAs('profile_images', $imageName, 'public');
            $user->profile_image = $imageName;
        }

        $user->update([
            'name' => $request->full_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
            'phone' => $request->phone,
            'status' => $request->status ?? $user->status,
            'level' => $request->level ?? $user->level,
            'department_id' => $request->department_id,
        ]);

        $user->syncRoles([$request->role]);
        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Delete a user and their image.
     */
    public function destroy(Admin $admin)
    {
        try {

            // Delete profile image if exists
            if ($admin->profile_image && Storage::disk('public')->exists('profile_images/' . $admin->profile_image)) {
                Storage::disk('public')->delete('profile_images/' . $admin->profile_image);
            }

            $admin->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reset a user's password.
     */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6',
            'confirm_password' => 'required|same:new_password',
        ]);

        $user = Admin::findOrFail($id);

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Old password is incorrect.',
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
