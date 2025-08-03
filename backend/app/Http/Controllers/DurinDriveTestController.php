<?php

namespace App\Http\Controllers;

use App\Models\DuringDriveTest;
use Illuminate\Http\Request;

class DurinDriveTestController extends Controller
{
    

    public function store(Request $request) {
        $validatedData = $request->validate([
            'job_card_no' => 'required',
            'plate_number' => 'nullable',
            'customer_name' => 'required',
            'checked_by' => 'required',
            'work_details' => 'required|array',
        ]);

        $test = DuringDriveTest::create($validatedData);
        return response()->json($test, 201);
    }
    public function show($id) {
        $test = DuringDriveTest::find($id);
        if (!$test) {
            return response()->json(['message' => 'Test not found'], 404);
        }
        return response()->json($test, 200);
    }
    
}
