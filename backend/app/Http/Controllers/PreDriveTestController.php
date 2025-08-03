<?php

namespace App\Http\Controllers;
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PreDriveTest;

class PreDriveTestController extends Controller {


    public function store(Request $request) {
        $validatedData = $request->validate([
            'job_card_no' => 'required',
            'plate_number' => 'nullable',
            'customer_name' => 'required',
            'checked_by' => 'required',
            'work_details' => 'required|array',
        ]);

        $test = PreDriveTest::create($validatedData);
        return response()->json($test, 201);
    }

    public function index() {
        return response()->json(PreDriveTest::all(), 200);
    }

    public function show($id) {
        $test = PreDriveTest::find($id);
        if (!$test) {
            return response()->json(['message' => 'Test not found'], 404);
        }
        return response()->json($test, 200);
    }

    
}

