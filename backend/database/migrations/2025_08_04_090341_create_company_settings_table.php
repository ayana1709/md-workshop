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
            $table->year('established')->nullable();
            $table->string('logo')->nullable(); // store path
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_settings');
    }
};
