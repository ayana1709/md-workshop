<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Vehicle;



class VehicleController extends Controller
{
    // Fetch customers
    public function getCustomers()
    {
        $customers = Customer::all(['id', 'name','carModels']);
        return response()->json(['data' => $customers], 200);
    }
    



    
   
    public function getJobOrders()
    {
        try {
            // Fetch vehicles with customer name and job order
            $vehicles = Vehicle::select('id', 'plate_number', 'job_order', 'customer_id', 'job_to_be_done','customer_observation','additional_work','date_in','promised_date')
                ->with('customer:id,name') // Load only customer name
                ->get()
                ->map(function ($vehicle) {
                    return [
                        'id' => $vehicle->id,
                        'plate_number' => $vehicle->plate_number,
                        'job_to_be_done' => $vehicle->job_to_be_done,
                        'date_in'=>$vehicle->date_in,
                        'promised_date'=>$vehicle->promised_date,
                        'additional_work'=> $vehicle->additional_work,
                        'customer_observation' => $vehicle->customer_observation,
                        'customer_name' => $vehicle->customer->name ?? 'N/A',
                        'job_order' => is_string($vehicle->job_order) 
                            ? json_decode($vehicle->job_order, true) 
                            : $vehicle->job_order, // Decode JSON if string
                    ];
                });
    
            return response()->json(['data' => $vehicles], 200);
        } catch (\Exception $e) {
            // Log the error for debugging
            // Log::error('Error fetching job orders:', ['exception' => $e]);
    
            return response()->json([
                'message' => 'Failed to fetch job orders.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    





    
    

    public function store(Request $request)
{
    try {
        // Validate the incoming request
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'plate_number' => 'required|string|max:255',
            'chasis_number' => 'required|string|max:255',
            'tin_number' => 'required|string|max:255',
            'date_in' => 'required|string|max:255',
            'promised_date' => 'required|string|max:255',

            'job_to_be_done' => 'required|string|max:255',
            'customer_observation' => 'required|string|max:255',
            'additional_work' => 'required|string|max:255',
            'vehicle_conditions' => 'array',
            'vehicle_conditions.*' => 'string',
            'job_order' => 'array',
            'job_order.*' => 'string',
            'labourData' => 'array',
            'labourData.*' => 'array',
            'spareData' => 'array',
            'spareData.*' => 'array',
            'outsource' => 'array',
            'outsource.*' => 'array',
            'lubricant' => 'array',
            'lubricant.*' => 'array',
            'price_estimation' => 'required|string|max:255',
            'km' => 'required|string|max:255',
            'recieved_by' => 'required|string|max:255',
            'status' => 'nullable|string|in:Pending,In_Progress,Completed,Cancelled',
        ]);

        // Create and save the vehicle
        $vehicle = Vehicle::create($validatedData);

        return response()->json([
            'message' => 'Vehicle registered successfully!',
            'vehicle' => $vehicle,
        ], 200);
    } catch (\Exception $e) {
        // Log the error
        // \Log::error("Error storing vehicle: " . $e->getMessage());
        return response()->json([
            'message' => 'Failed to register vehicle.',
            'error' => $e->getMessage()
        ], 500);
    }
}







public function index()
{
    try {
        // Retrieve all vehicles from the database
        $vehicles = Vehicle::all();

        return response()->json([
            'message' => 'Vehicles fetched successfully!',
            'vehicles' => $vehicles,
        ], 200);
    } catch (\Exception $e) {
        // Log the error
     
        return response()->json([
            'message' => 'Failed to fetch vehicles.',
            'error' => $e->getMessage()
        ], 500);
    }
}





public function show($id)
    {
        try {
            // Find the vehicle by ID or throw a 404
            $vehicle = Vehicle::findOrFail($id);

            return response()->json([
                'message' => 'Vehicle details fetched successfully!',
                'vehicle' => $vehicle,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch vehicle details.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function updatePriority(Request $request, $id)
    {
        $validated = $request->validate(['priority' => 'required|string|in:Urgent,High,Medium,Low']);

        $jobOrder = Vehicle::find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job order not found'], 404);
        }

        $jobOrder->priority = $validated['priority'];
        $jobOrder->save();

        return response()->json(['data' => $jobOrder]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate(['status' => 'required|string|in:Pending,In_Progress,Completed,Cancelled']);

        $jobOrder = Vehicle::find($id);

        if (!$jobOrder) {
            return response()->json(['error' => 'Job order not found'], 404);
        }

        $jobOrder->status = $validated['status'];
        $jobOrder->save();

        return response()->json(['data' => $jobOrder]);
    }

}
