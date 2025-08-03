<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Customer;
use Barryvdh\DomPDF\Facade\Pdf;

class CustomerController extends Controller
{
    public function index() {
        $customers = Customer::all();
        return response()->json(['data' => $customers], 200);
    }


    public function show($id)
    {
        try {
            $customer = Customer::find($id);
    
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }
    
            return response()->json($customer, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching customer data: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
    
    
    

    // Update customer details
    public function update(Request $request, $id)
    {
        try {
            $customer = Customer::findOrFail($id);
    
            // Update customer details
            $customer->update($request->only('name', 'customerType', 'telephone'));
    
            // Update car models (if it's stored as a JSON array)
            $customer->update([
                'carModels' => $request->input('carModels', [])
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer: ' . $e->getMessage(),
            ], 500);
        }
    }
    



    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'customerType' => 'required|in:regular,contract',
            'telephone' => 'required|string|max:15',
            'carModels' => 'array',
            'carModels.*' => 'array',
        ]);
    
      
        return Customer::create($validated);
    }
    

















    public function printReport($id)
{
    // Fetch the customer and their related car details
    $customer = Customer::with('carModel')->find($id);

    if (!$customer) {
        return response()->json(['error' => 'Customer not found'], 404);
    }

    // Generate and return the PDF
    return $this->generatePdf($customer);
}

private function generatePdf($customer)
{
    // Load the data into a Blade view for the report
    $pdf = Pdf::loadView('reports.customer', compact('customer'));

    // Stream or download the PDF
    return $pdf->download("Customer_Report_{$customer->id}.pdf");
}



}

