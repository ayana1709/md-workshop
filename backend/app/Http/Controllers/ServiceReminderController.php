<?php

namespace App\Http\Controllers;

use App\Models\ServiceReminder;
use Illuminate\Http\Request;

class ServiceReminderController extends Controller
{
    public function index()
    {
        return ServiceReminder::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'job_card_id' => 'required|string',
            'customer_name' => 'required|string',
            'plate_number' => 'required|string',
            'reminders' => 'required|array',
            'reminders.*.name' => 'required|string',
            'reminders.*.km' => 'required|string',
            'approved_by' => 'nullable|string',
        ]);

        $reminder = ServiceReminder::create($request->all());

        return response()->json([
            'message' => 'Service Reminder saved successfully.',
            'data' => $reminder
        ], 201);
    }

    public function show($id)
    {
        return ServiceReminder::findOrFail($id);
    }
    public function getByPlate($plateNumber)
{
    $reminder = ServiceReminder::where('plate_number', $plateNumber)->first();

    if (!$reminder) {
        return response()->json(['message' => 'Not found'], 404);
    }

    return response()->json($reminder);
}

}
