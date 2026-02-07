<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAuthController extends Controller
{
   public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    $admin = Admin::with('branch')->where('username', $request->username)->first();

    if (! $admin || ! Hash::check($request->password, $admin->password)) {
        return response()->json(['message' => 'Invalid username or password'], 401);
    }

    // Load roles
    $admin->load('roles');

    // Generate token
    $token = $admin->createToken('admin-token')->plainTextToken;

    // Prepare branch info based on role
    $branchInfo = $admin->isSuperAdmin()
        ? Branch::all()  // Admin can see all branches
        : $admin->branch; // Normal user sees only their branch

    return response()->json([
        'message' => 'Login successful',
        'admin' => $admin,
        'branch' => $branchInfo,
        'token' => $token,
    ]);
}


    public function logout(Request $request)
    {
        $request->user()->tokens()->delete(); // Revoke all tokens

        return response()->json([
            'message' => 'Successfully logged out',
        ], 200);
    }
}
