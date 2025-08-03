<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('store_item_logs', function (Blueprint $table) {
            $table->id();
            $table->string('code'); // Item Code

            // Quantity changes (Nullable for general updates)
            $table->integer('old_quantity')->nullable();
            $table->integer('new_quantity')->nullable();
            $table->integer('change_amount')->nullable();
            // Full item update tracking
            $table->json('old_values')->nullable(); // Store old data before update
            $table->json('new_values')->nullable(); // Store new updated data
            $table->string('changed_fields')->nullable(); // Track which fields changed

            // User tracking
            $table->unsignedBigInteger('user_id')->nullable()->index(); // Track who made the change
            
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('store_item_logs');
    }
};
