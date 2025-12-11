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
            $table->string('requested_user')->nullable()->comment('User ID who created the request (FK if applicable)');
            $table->string('requested_department')->comment('Department making the request');
            $table->string('requested_from')->comment('The store/branch they are requesting from');
            $table->text('request_remark')->nullable();

            $table->string('approved_by')->nullable()->comment('User ID of the approver');
            $table->string('approved_name')->nullable()->comment('Name of the approver');
            $table->string('approved_dept')->nullable()->comment('Department of the approver');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('approved_remark')->nullable();
            $table->date('approved_date')->nullable();

            $table->json('requested_items')->comment('Array of items requested with required qty, specifications, etc.');

            $table->boolean('is_fully_issued')->default(false)->comment('Track if all requested items have been issued.');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_requests');
    }
};
