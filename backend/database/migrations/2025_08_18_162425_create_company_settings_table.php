<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_am')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('tin')->nullable();
            $table->string('vat')->nullable();
            $table->string('website')->nullable();
            $table->string('business_type')->nullable();
            $table->string('tagline')->nullable();
            $table->string('username')->nullable();
            $table->string('established')->nullable();
            $table->string('login_page_name')->nullable();
            $table->string('login_page_name_am')->nullable();
            $table->string('date_format')->default('DD/MM/YYYY');
            $table->string('payment_ref_start')->default('REF0001');
            $table->string('proforma_ref_start')->default('REF0001');
            $table->string('storeout_ref_start')->nullable();
            $table->string('logo')->nullable(); 
            $table->string('profile_image')->nullable(); 
            // store path
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_settings');
    }
};
