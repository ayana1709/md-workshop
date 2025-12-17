<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Department::with('admin')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validation
        $validated = $request->validate([
            'dept_name' => 'required|string|unique:departments,name',
            'description' => 'nullable|string',
            'admin_id' => 'required|exists:admins,id', // Matches your React form
            'status' => 'required|string|in:active,inactive',
        ]);

        // 2. Execution via Transaction
        try {
            return DB::transaction(function () use ($validated) {

                // Create the Department linked to the EXISTING Admin
                $department = Department::create([
                    'name' => $validated['dept_name'],
                    'description' => $validated['description'],
                    'admin_id' => $validated['admin_id'],
                    'status' => $validated['status'],
                ]);

                // Link the Admin back to the Department (The Workspace link)
                $admin = Admin::find($validated['admin_id']);
                $admin->update(['department_id' => $department->id]);

                return response()->json($department->load('admin'), 201);
            });
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        return response()->json($department->load('admin'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        try {
            $validated = $request->validate([
                'dept_name' => 'string|unique:departments,name,'.$department->id,
                'description' => 'nullable|string',
                'admin_id' => 'exists:admins,id',
                'status' => 'string|in:active,inactive',
            ]);

            return DB::transaction(function () use ($validated, $department) {
                // 1. If the admin is changing, we need to clean up the OLD admin first
                if (isset($validated['admin_id']) && $department->admin_id != $validated['admin_id']) {
                    // Remove the department link from the old admin
                    Admin::where('department_id', $department->id)
                        ->update(['department_id' => null]);
                }

                // 2. Update the department
                $department->update([
                    'name' => $validated['dept_name'] ?? $department->name,
                    'description' => $validated['description'] ?? $department->description,
                    'admin_id' => $validated['admin_id'] ?? $department->admin_id,
                    'status' => $validated['status'] ?? $department->status,
                ]);

                // 3. Link the NEW admin to this department
                Admin::where('id', $department->admin_id)
                    ->update(['department_id' => $department->id]);

                return response()->json($department->load('admin'));
            });
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department)
    {
        try {
            return DB::transaction(function () use ($department) {

                Admin::where('department_id', $department->id)
                    ->update(['department_id' => null]);

                $department->delete();

                return response()->json(['message' => 'Department deleted successfully']);
            });
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not delete: '.$e->getMessage()], 500);
        }
    }
}
