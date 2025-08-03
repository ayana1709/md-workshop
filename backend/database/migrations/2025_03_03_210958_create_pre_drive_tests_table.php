<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('pre_drive_tests', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_no');
            $table->string('plate_number')->nullable();
            $table->string('customer_name');
            $table->string('checked_by');
            $table->json('work_details'); // Store tests in JSON format
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('pre_drive_tests');
    }
};
