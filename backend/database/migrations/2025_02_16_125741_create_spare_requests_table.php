<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spare_requests', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_no');
            $table->string('plate_number');
            $table->string('customer_name');
            $table->string('repair_category');
            $table->json('sparedetails');

            // ✅ Ensure item_id matches items.id
            $table->unsignedBigInteger('item_id')->nullable();
            $table->foreign('item_id')->references('id')->on('items')->onDelete('set null');

            $table->decimal('unit_price', 10, 2)->nullable();
            // $table->string('status');

            $table->timestamps();
            $table->engine = 'InnoDB'; // ✅ Ensure InnoDB
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_requests');
    }
};
