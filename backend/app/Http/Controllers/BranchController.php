<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Admin;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Get all branches
     */
   public function index()
{
    $branches = Branch::orderBy('name')->get();

    if ($branches->isEmpty()) {
        return response()->json([]);
    }

    return response()->json($branches);
}
    /**
     * Store new branch
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:branches,name',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $branch = Branch::create($validated);

        return response()->json($branch, 201);
    }

    /**
     * Show single branch
     */
    public function show(Branch $branch)
    {
        return response()->json($branch);
    }

    /**
     * Update branch
     */
    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:branches,name,' . $branch->id,
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $branch->update($validated);

        return response()->json($branch);
    }

    /**
     * Delete branch
     */
    public function destroy(Branch $branch)
    {
        // Detach admins first (important)
        Admin::where('branch_id', $branch->id)
            ->update(['branch_id' => null]);

        $branch->delete();

        return response()->json([
            'message' => 'Branch deleted successfully'
        ]);
    }

    /**
     * 🔹 Get all admins/users in this branch
     */
    public function users(Branch $branch)
    {
        $admins = Admin::where('branch_id', $branch->id)
            ->select('id', 'name', 'email', 'status','profile_image')
            ->get();

        return response()->json([
            'branch' => $branch,
            'users' => $admins
        ]);
    }
}
