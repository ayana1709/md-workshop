<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repair_details', function (Blueprint $table) {
            $table->id();
            $table->string('job_id'); // FK to repair_registrations.job_id
            $table->json('tasks')->nullable();   // store as JSON array
            $table->json('spares')->nullable();  // store as JSON array
            $table->decimal('other_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->boolean('vat_applied')->default(false); // NEW → track if VAT applied
            $table->decimal('vat_amount', 10, 2)->default(0); // NEW → VAT amount
            $table->string('status')->nullable();
            $table->integer('progress')->default(0);
            $table->timestamps();

            $table->foreign('job_id')
                  ->references('job_id')
                  ->on('repair_registrations')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repair_details');
    }
};
