<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanySetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
// use Illuminate\Support\Facades\Storage;

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
        'established' => 'nullable|digits:4|integer',
        'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    $setting = CompanySetting::firstOrNew([]);

    // ✅ Upload logo if a file is present
    if ($request->hasFile('logo')) {
        if ($setting->logo) {
            Storage::disk('public')->delete($setting->logo);
        }

        $file = $request->file('logo');
        $filename = $file->store('logos', 'public');
        $validated['logo'] = $filename;
    }

    $setting->fill($validated);
    $setting->save();

    return response()->json($setting);
}




}
