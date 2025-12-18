<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Admin;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Get all departments
     */
    public function index()
    {
        return response()->json(
            Department::orderBy('name')->get()
        );
    }

    /**
     * Store new department
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:departments,name',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $department = Department::create($validated);

        return response()->json($department, 201);
    }

    /**
     * Show single department
     */
    public function show(Department $department)
    {
        return response()->json($department);
    }

    /**
     * Update department
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:departments,name,' . $department->id,
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $department->update($validated);

        return response()->json($department);
    }

    /**
     * Delete department
     */
    public function destroy(Department $department)
    {
        // Detach admins first (important)
        Admin::where('department_id', $department->id)
            ->update(['department_id' => null]);

        $department->delete();

        return response()->json([
            'message' => 'Department deleted successfully'
        ]);
    }

    /**
     * 🔹 Get all admins/users in this department
     */
    public function users(Department $department)
    {
        $admins = Admin::where('department_id', $department->id)
            ->select('id', 'name', 'email', 'status','profile_image')
            ->get();

        return response()->json([
            'department' => $department,
            'users' => $admins
        ]);
    }
}
