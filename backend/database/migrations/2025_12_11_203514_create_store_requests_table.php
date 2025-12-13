<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_requests', function (Blueprint $table) {
            $table->id();

            $table->date('date')->comment('Request Date')->index();
            $table->string('ref_no')->unique()->comment('Request Reference Number');
            $table->string('objective_for')->comment('Reason/Objective for the request');
            $table->integer('priority')->comment('Priority level (e.g., 1 for Urgent)');

            $table->string('requested_by')->comment('User who created the request');
            $table->string('requested_department')->comment('Department making the request');

            $table->json('requested_items')->comment('Array of items requested with required qty, specifications, etc.');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_requests');
    }
};
