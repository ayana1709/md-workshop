<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Admin;

use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;

class AdminAuthController extends Controller
{
    public function login(Request $request)
{
    // Validate input
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

    // Retrieve admin by username
    $admin = Admin::where('username', $request->username)->first();

    if (!$admin || !Hash::check($request->password, $admin->password)) {
        return response()->json(['message' => 'Invalid username or password'], 401);
    }

    // ✅ Load roles relationship
    $admin->load('roles');

    // Generate token for the admin
    $token = $admin->createToken('admin-token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'admin' => $admin,
        'token' => $token
    ]);
}


    public function logout(Request $request)
{
    $request->user()->tokens()->delete(); // Revoke all tokens

    return response()->json([
        'message' => 'Successfully logged out'
    ], 200);
}

}
