<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanySetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class CompanySettingController extends Controller
{
    public function index()
    {
        $setting = CompanySetting::first();
        return response()->json($setting);
    }

 public function store(Request $request)
{
    $validated = $request->validate([
        'name_en' => 'required|string|max:255',
        'name_am' => 'nullable|string|max:255',
        'phone' => 'nullable|string|max:50',
        'email' => 'nullable|email',
        'address' => 'nullable|string',
        'tin' => 'nullable|string',
        'vat' => 'nullable|string',
        'website' => 'nullable|string',
        'business_type' => 'nullable|string',
        'tagline' => 'nullable|string',
        'established' => 'nullable|string|max:50',
        'login_page_name' => 'nullable|string|max:255',
        'login_page_name_am' => 'nullable|string|max:255',
        'username' => 'nullable|string|max:255',

        // ❗ No file size limit — only type validation
        'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp',
        'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,webp',

        'date_format' => 'nullable|string',
        'payment_ref_start' => 'nullable|string|max:20',
        'proforma_ref_start' => 'nullable|string|max:20',
        'storeout_ref_start' => 'nullable|string|max:20',
    ]);

    $setting = CompanySetting::firstOrNew([]);

    // ✅ Handle logo upload
    if ($request->hasFile('logo')) {

        if ($setting->logo) {
            Storage::disk('public')->delete($setting->logo);
        }

        $validated['logo'] = $request
            ->file('logo')
            ->store('company/logo', 'public');
    }

    // ✅ Handle profile image upload (NO SIZE LIMIT)
    if ($request->hasFile('profile_image')) {

        // Delete old one
        if ($setting->profile_image) {
            Storage::disk('public')->delete($setting->profile_image);
        }

        // Store new one
        $validated['profile_image'] = $request
            ->file('profile_image')
            ->store('company/profile', 'public'); 
    }

    $setting->fill($validated);
    $setting->save();

    return response()->json($setting);
}




public function resetSystem()
{
    try {

        // 🔥 Fresh migration + seed
        \Artisan::call('migrate:fresh --seed');

        // 🔥 Run AdminSeeder separately
        \Artisan::call('db:seed', [
            '--class' => 'AdminSeeder'
        ]);

        // 🔥 Delete old storage link
        if (is_link(public_path('storage'))) {
            unlink(public_path('storage'));
        }

        // 🔥 Rebuild storage folder
        \Illuminate\Support\Facades\File::deleteDirectory(storage_path('app/public'));
        \Illuminate\Support\Facades\File::makeDirectory(storage_path('app/public'), 0777, true);

        // 🔥 Create storage link
        \Artisan::call('storage:link');

        // 🔥 Clear Laravel cache
        \Artisan::call('optimize:clear');

        return response()->json([
            'status' => 'success',
            'message' => 'System reset successfully',
           'redirect' => config('app.frontend_url') ?? '/',

        ]);

    } catch (\Exception $e) {

       return response()->json([
    'status' => 'success',
    'message' => 'System reset successfully',
    'redirect' => config('app.frontend_url')
]);

    }
}


public function exportDatabase()
{
    try {
        $tables = DB::select('SHOW TABLES');
        $dbName = env("DB_DATABASE");

        $tableKey = "Tables_in_" . $dbName;

        $exportData = [];

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;

            // Skip Laravel internal tables
            if (in_array($tableName, [
                'migrations',
                'password_reset_tokens',
                'failed_jobs',
                'personal_access_tokens'
            ])) {
                continue;
            }

            $exportData[$tableName] = DB::table($tableName)->get()->toArray();
        }

        // File name
        $fileName = "backup_" . date("Y-m-d_H-i-s") . ".json";

        // Save to storage/app/backups/
        Storage::disk('local')->put("backups/" . $fileName, json_encode($exportData, JSON_PRETTY_PRINT));

        return response()->json([
            "message" => "Backup exported successfully!",
            "file" => $fileName,
            "download_url" => url("/download-backup/" . $fileName),
        ]);

    } catch (\Exception $e) {
        return response()->json([
            "message" => "Export failed!",
            "error" => $e->getMessage()
        ], 500);
    }
}


}

