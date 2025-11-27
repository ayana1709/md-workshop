<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        $imageName = null;
        if ($request->hasFile('profile_image')) {
            $imageName = time().'_'.$request->profile_image->getClientOriginalName();
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
            'profile_image' => $imageName
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
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        // Handle Image Change
        if ($request->hasFile('profile_image')) {
            if ($user->profile_image && Storage::disk('public')->exists('profile_images/' . $user->profile_image)) {
                Storage::disk('public')->delete('profile_images/' . $user->profile_image);
            }

            $imageName = time().'_'.$request->profile_image->getClientOriginalName();
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
        ]);

        $user->syncRoles([$request->role]);
        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Delete a user and their image.
     */
    public function destroy($id)
    {
        $user = Admin::findOrFail($id);

        if ($user->profile_image && Storage::disk('public')->exists('profile_images/' . $user->profile_image)) {
            Storage::disk('public')->delete('profile_images/' . $user->profile_image);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate(['password' => 'required|string|min:6']);

        $user = Admin::findOrFail($id);
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
