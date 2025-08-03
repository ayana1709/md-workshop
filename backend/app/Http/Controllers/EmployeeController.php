<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller

{

    public function getCustomers()
    {
        $customers = Employee::all(['id', 'full_name',]);
        return response()->json(['data' => $customers], 200);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'contact_information' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'address' => 'required|string',
            'gender' => 'required|in:Male,Female,Other',
        ]);

        Employee::create($validated);

        return response()->json(['message' => 'Employee registered successfully!'], 201);
    }

    public function index()
    {
        return Employee::all();
    }
}

