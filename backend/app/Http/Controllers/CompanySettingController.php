<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanySetting;
use Illuminate\Support\Facades\Storage;

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
    ]);

    $setting = CompanySetting::firstOrNew([]);

    if ($request->has('logo')) {
        $logo = $request->logo;

        if (is_string($logo)) {
            // It's base64 or filename
            if (Str::startsWith($logo, 'data:image')) {
                // ✅ base64 image string
                preg_match("/data:image\/(.*?);base64,(.*)/", $logo, $matches);
                $extension = $matches[1];
                $imageData = base64_decode($matches[2]);

                $filename = 'logos/' . uniqid() . '.' . $extension;
                Storage::disk('public')->put($filename, $imageData);
                $validated['logo'] = $filename;
            }
        } elseif ($request->hasFile('logo')) {
            // ✅ Fallback for standard file uploads
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }

            $file = $request->file('logo');
            $filename = $file->store('logos', 'public');
            $validated['logo'] = $filename;
        }
    }

    $setting->fill($validated);
    $setting->save();

    return response()->json($setting);
}

}
