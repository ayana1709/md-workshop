<?php

// app/Http/Controllers/ProformaController.php

namespace App\Http\Controllers;

use App\Models\Proforma;
use App\Models\ProformaItem;
use Illuminate\Http\Request;

class ProformaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jobId' => 'nullable|string',
            'date' => 'required|date',
            'customerName' => 'required|string',
            'plateNo' => 'required|string',
            'vehicleType' => 'required|string',
            'preparedBy' => 'required|string',
            'deliveryTime' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric',
            'items.*.materialCost' => 'required|numeric',
            'items.*.laborCost' => 'required|numeric',
            'items.*.totalCost' => 'required|numeric',
        ]);

        $netTotal = collect($validated['items'])->sum('totalCost');

        $proforma = Proforma::create([
            'job_id' => $validated['jobId'],
            'date' => $validated['date'],
            'customer_name' => $validated['customerName'],
            'plate_no' => $validated['plateNo'],
            'vehicle_type' => $validated['vehicleType'],
            'prepared_by' => $validated['preparedBy'],
            'delivery_time' => $validated['deliveryTime'],
            'notes' => $validated['notes'],
            'net_total' => $netTotal,
        ]);

        foreach ($validated['items'] as $item) {
            $proforma->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'material_cost' => $item['materialCost'],
                'labor_cost' => $item['laborCost'],
                'total_cost' => $item['totalCost'],
            ]);
        }

        return response()->json(['message' => 'Proforma created', 'id' => $proforma->id]);
    }

    public function index()
{
    return Proforma::latest()->get();
}

public function destroy($id)
{
    $proforma = Proforma::findOrFail($id);
    $proforma->delete();

    return response()->json(['message' => 'Proforma deleted successfully']);
}

}
