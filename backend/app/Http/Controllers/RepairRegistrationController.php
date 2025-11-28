<?php

namespace App\Http\Controllers;

use App\Models\PostDriveTest;
use App\Models\RepairRegistration;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class RepairRegistrationController extends Controller
{
public function index()
{
    try {
        $repairs = RepairRegistration::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $repairs->count(),
            'data' => $repairs
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error fetching repairs',
            'error' => $e->getMessage()
        ], 500);
    }
}


    
    



public function store(Request $request)
{
    if (!$request->isMethod('post')) {
        return response()->json(['error' => 'Invalid request method'], 405);
    }

    $payload = json_decode($request->input('payload'), true);

    if (!$payload) {
        return response()->json(['message' => 'Invalid JSON payload'], 400);
    }

    $validated = validator($payload, [
        'customer_name' => 'required|string|max:255',
        'mobile' => 'required|string|max:20',
        'types_of_jobs' => 'nullable|string',
        'received_date' => 'required|date',
        'estimated_date' => 'nullable|string',
        'promise_date' => 'nullable|date',
        'priority' => 'required|string',
        'product_name' => 'nullable|string|max:255',
        'serial_code' => 'nullable|string|max:255',
        'spare_change' => 'nullable|array',
        'job_description' => 'nullable|array',
        'received_by' => 'nullable|string',
    ])->validate();

    try {
        // Generate job_id
        $lastJob = RepairRegistration::latest('job_id')->first();
        $nextJobId = $lastJob ? str_pad(((int)$lastJob->job_id) + 1, 4, '0', STR_PAD_LEFT) : '0001';

        while (RepairRegistration::where('job_id', $nextJobId)->exists()) {
            $nextJobId = str_pad(((int)$nextJobId) + 1, 4, '0', STR_PAD_LEFT);
        }

        // Handle image upload (single image) or fallback to default
        $imagePath = 'repair_images/default.jpg'; // 👈 put a default.png inside storage/app/public/repair_images

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

            // Store file in storage/app/public/repair_images
            $file->storeAs('public/repair_images', $filename);

            // Save only relative path for access from /storage
            $imagePath = 'repair_images/' . $filename;
        }

        // Create repair registration
        $repair = new RepairRegistration();
        $repair->job_id = $nextJobId;
        $repair->customer_name = $payload['customer_name'];
        $repair->mobile = $payload['mobile'];
        $repair->types_of_jobs = $payload['types_of_jobs'] ?? null;
        $repair->received_date = $payload['received_date'];
        $repair->estimated_date = $payload['estimated_date'] ?? null;
        $repair->promise_date = $payload['promise_date'] ?? null;
        $repair->priority = $payload['priority'];
        $repair->product_name = $payload['product_name'] ?? null;
        $repair->serial_code = $payload['serial_code'] ?? null;
        $repair->spare_change = $payload['spare_change'] ?? null;
        $repair->job_description = $payload['job_description'] ?? null;
        $repair->received_by = $payload['received_by'] ?? null;
        $repair->image = $imagePath;

        $repair->save();

        return response()->json([
            'message' => 'Repair created successfully',
            'job_id' => $repair->job_id
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error storing repair',
            'error' => $e->getMessage()
        ], 500);
    }
}


    
public function update(Request $request, $id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found'], 404);
    }

    // 👇 Decode JSON from 'payload'
    $payload = json_decode($request->input('payload'), true);

    if (!$payload) {
        return response()->json(['message' => 'Invalid JSON payload'], 400);
    }

    // ✅ Validate decoded payload
    $validated = validator($payload, [
        'job_id' => 'required|string|unique:repair_registrations,job_id,' . $repair->id,
        'customer_name' => 'required|string|max:255',
        // 'customer_type' => 'required|string|max:255',
        'mobile' => 'required|string|max:20',
        'types_of_jobs' => 'nullable|string',
        'received_date' => 'required|date',
        'estimated_date' => 'nullable|string',
        'promise_date' => 'nullable|date',
        'priority' => 'required|string',
        'product_name' => 'nullable|string|max:255',
        'serial_code' => 'nullable|string|max:255',
        'customer_observation' => 'nullable|array',
        'spare_change' => 'nullable|array',
        'job_description' => 'nullable|array',
        'received_by' => 'nullable|string',
    ])->validate();

    try {
        // ✅ Handle optional new image
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/repair_images', $filename);
            $validated['image'] = 'repair_images/' . $filename;
        }

        // ✅ Update all fields (including image if uploaded)
        $repair->update($validated);

        return response()->json(['message' => 'Repair updated successfully'], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error updating repair',
            'error' => $e->getMessage()
        ], 500);
    }
}

private function parseDate($value)
{
    if (empty($value)) return null;

    // Excel numeric date
    if (is_numeric($value)) {
        try {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)
                ->format('Y-m-d H:i:s');
        } catch (\Exception $e) {}
    }

    // Many formats
    $formats = [
        'Y-m-d','m/d/Y','d/m/Y','m-d-Y','d-m-Y',
        'M d, Y','d M Y','F d, Y','d F Y','m/d/y','d/m/y',
    ];

    foreach ($formats as $format) {
        $d = \DateTime::createFromFormat($format, trim($value));
        if ($d && $d->format($format) === trim($value)) {
            return $d->format('Y-m-d H:i:s');
        }
    }

    // fallback
    try {
        return date('Y-m-d H:i:s', strtotime($value));
    } catch (\Exception $e) { return null; }
}


public function importExcel(Request $request)
{
    if (!$request->hasFile('file')) {
        return response()->json([
            'status' => 'error',
            'message' => 'No file uploaded.'
        ], 400);
    }

    try {
        $file = $request->file('file');
        $path = $file->getRealPath();

        $sheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path)
            ->getActiveSheet()
            ->toArray(null, true, true, true);

        if (count($sheet) < 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Excel file is empty.'
            ], 400);
        }

        // Read column headers
        $headers = [];
        foreach ($sheet[1] as $col => $value) {
            $headers[strtolower(trim($value))] = $col;
        }

        // Column mapping
        $map = [
            'customer name' => 'customer_name',
            'mobile' => 'mobile',
            'job type' => 'types_of_jobs',
            'product' => 'product_name',
            'serial code' => 'serial_code',
            'duration' => 'estimated_date',
            'start date' => 'received_date',
            'end date' => 'promise_date',
            'received by' => 'received_by',
            'status' => 'priority'
        ];

        $inserted = 0;

        foreach ($sheet as $index => $row) {
            if ($index == 1) continue;

            $data = [];

            foreach ($map as $excelName => $dbField) {
                $data[$dbField] = isset($headers[$excelName])
                    ? ($row[$headers[$excelName]] ?? null)
                    : null;
            }

            if (empty($data['customer_name']) && empty($data['mobile'])) {
                continue;
            }

            // Auto Date Conversion
            $received = $this->parseDate($data['received_date']) ?? now();
            $promise  = $this->parseDate($data['promise_date']);

            // Estimate days
            if (is_numeric($data['estimated_date'])) {
                $data['estimated_date'] = (int)$data['estimated_date'];
            } else {
                if ($received && $promise) {
                    $start = new \DateTime($received);
                    $end = new \DateTime($promise);
                    $data['estimated_date'] = $start->diff($end)->days;
                } else {
                    $data['estimated_date'] = 0;
                }
            }

            $data['received_date'] = $received;
            $data['promise_date'] = $promise;

            // Default values same with store()
            $data['image'] = 'repair_images/default.jpg';
            $data['status'] = 'not started';

            // Default array format (NOT JSON string)
            $data['spare_change'] = [
                [
                    "item" => "1. ",
                    "part_number" => "",
                    "qty" => "",
                    "unit_price" => "",
                    "total_price" => 0,
                ]
            ];

            $data['job_description'] = [
                [
                    "task" => "1. ",
                    "price" => "",
                ]
            ];

            // Generate Sequential Job ID
            $lastJob = RepairRegistration::latest('job_id')->first();
            $nextJobId = $lastJob ? str_pad(((int)$lastJob->job_id) + 1, 4, '0', STR_PAD_LEFT) : '0001';
            while (RepairRegistration::where('job_id', $nextJobId)->exists()) {
                $nextJobId = str_pad(((int)$nextJobId) + 1, 4, '0', STR_PAD_LEFT);
            }

            $data['job_id'] = $nextJobId;

            RepairRegistration::create($data);

            $inserted++;
        }

        return response()->json([
            'status' => 'success',
            'count' => $inserted,
            'message' => "Successfully imported $inserted repairs."
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Import failed',
            'error' => $e->getMessage()
        ], 500);
    }
}






public function destroy($id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found'], 404);
    }

    $repair->delete();

    return response()->json(['message' => 'Repair deleted successfully'], 200);
}


public function show($id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found.'], 404);
    }

    return response()->json([
        'id' => $repair->id,
        'job_id' => $repair->job_id,
        'customer_name' => $repair->customer_name,
        'mobile' => $repair->mobile,
        'types_of_jobs' => $repair->types_of_jobs,
        'product_name' => $repair->product_name,
        'serial_code' => $repair->serial_code,
        'received_date' => $repair->received_date,
        'estimated_date' => $repair->estimated_date,
        'promise_date' => $repair->promise_date,
        'priority' => $repair->priority,
        'received_by' => $repair->received_by,
        'status' => $repair->status,
        'customer_observation' => $repair->customer_observation,
        'spare_change' => $repair->spare_change,
        'job_description' => $repair->job_description,
        'image_url' => $repair->image ? asset('storage/' . $repair->image) : null,
    ]);
}

public function showBasicInfo($id)
{
    try {
        $repair = RepairRegistration::find($id);

        if (!$repair) {
            return response()->json(['message' => 'Repair not found.'], 404);
        }

        return response()->json([
            'customer_name'   => $repair->customer_name,
            'product_name'    => $repair->product_name,
            'serial_code'     => $repair->serial_code,
            'types_of_jobs'   => $repair->types_of_jobs,
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Server error'], 500);
    }
}









public function getVehiclesByRepairId($id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['message' => 'Repair not found'], 404);
    }

    return response()->json(['vehicles' => $repair->vehicles]);
}


public function totalRepairs()
{
    try {
        // Count all repair records
        $totalRepairs = RepairRegistration::count();

        // return only the number
        return response()->json($totalRepairs);
    } catch (\Exception $e) {
        return response()->json(0, 500); // fallback: 0 if error
    }
}





public function deleteRepairs(Request $request)
{
    // Debugging: Check if repair_ids is passed correctly
    // dd($request->repair_ids); // Uncomment for debugging purposes

    // Validation for the repair_ids array
    $request->validate([
        'repair_ids' => 'required|array', // repair_ids must be an array
        'repair_ids.*' => 'exists:repair_registrations,id' // Each id must exist in the repair_registrations table
    ]);

    // Delete the repairs
    $deleted = RepairRegistration::whereIn('id', $request->repair_ids)->delete();

    // Check if any records were deleted
    if ($deleted > 0) {
        return response()->json(['message' => 'Selected repairs deleted successfully']);
    } else {
        return response()->json(['message' => 'No repairs found to delete'], 404);
    }
}


public function updateStatus(Request $request, $id)
{
    $repair = RepairRegistration::find($id);

    if (!$repair) {
        return response()->json(['error' => 'Repair registration not found'], 404);
    }

    $repair->status = $request->status; // Get the new status from request
    $repair->save();

    return response()->json(['message' => 'Status updated successfully!', 'status' => $repair->status]);
}

public function updatestat(Request $request, $id)
{
    $repair = RepairRegistration::find($id);
    if (!$repair) {
        return response()->json(['message' => 'Repair not found.'], 404);
    }

    $repair->status = $request->input('status');
    $repair->save();

    return response()->json(['message' => 'Status updated successfully.']);
}
public function getByJobId($jobId) 
{
    // Fetch using job_id instead of primary key id
    $repair = RepairRegistration::where('job_id', $jobId)->first();

    if (!$repair) {
        return response()->json(['message' => 'Repair not found.'], 404);
    }

    return response()->json([
        'job_id'        => $repair->job_id,
        'customer_name' => $repair->customer_name,
        'mobile'        => $repair->mobile,
        'product_name'  => $repair->product_name,
        'serial_code'   => $repair->serial_code,
        'types_of_jobs' => $repair->types_of_jobs,
        'priority'      => $repair->priority,
        'received_date' => $repair->received_date,
        'promise_date'  => $repair->promise_date,
        'status'        => $repair->status ?? 'Pending',
        
        // ✅ Add image with default fallback
        'image'         => $repair->image 
            ? asset('storage/' . $repair->image) 
            : asset('storage/repair_images/default.png'),
    ]);
}




public function getBatchByJobIds(Request $request)
{
    $jobIds = $request->input('job_ids', []);

    $repairs = RepairRegistration::with('vehicles')
        ->whereIn('job_id', $jobIds)
        ->get();

    // Make sure testDrives keys are padded
    $testDrives = PostDriveTest::whereIn('job_card_no', $jobIds)
        ->get()
        ->keyBy(function ($item) {
            return str_pad($item->job_card_no, 4, '0', STR_PAD_LEFT);
        });

    $result = [];

    foreach ($repairs as $repair) {
        $jobId = str_pad($repair->job_id, 4, '0', STR_PAD_LEFT);
        $vehicle = $repair->vehicles->first();

        $testDrive = $testDrives[$jobId] ?? null;

        $result[$jobId] = [
            'plate_no' => $vehicle?->plate_no,
            'start_date' => $repair->received_date,
            'end_date' => $repair->promise_date,
            'status' => $repair->status,
            'received_date' => $testDrive?->checked_date ?? null,
            'technician_final_approval' => $testDrive?->technician_final_approval ?? null,
        ];
    }

    return response()->json($result);
}







}
