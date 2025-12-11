<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_issues', function (Blueprint $table) {
            $table->id();

            // basic-info
            $table->date('date')->comment('Issue Date')->index();
            $table->string('ref_no')->unique()->comment('Reference Number');
            $table->string('objective_for')->comment('Reason for the issue');
            $table->integer('priority')->comment('Priority level (e.g., 1 for Urgent)');

            // store items
            $table->json('store_items')->comment('Array of items requested with qty, price, etc.');

            $table->string('received_by')->nullable()->comment('Person who received the items');

            //C) cost breakdown
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total_vat', 10, 2);
            $table->decimal('total_price_including_vat', 10, 2);
            $table->string('amount_in_words');

            // approval and status tracking
            $table->string('requested_from');
            $table->string('store_branch');
            $table->string('requested_by');
            $table->string('requested_department');
            $table->string('requested_user')->nullable();
            $table->enum('requested_status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('request_remark')->nullable();
            $table->date('requested_date')->nullable();

            // Delivery details
            $table->string('delivered_by')->nullable();
            $table->string('delivered_dept')->nullable();
            $table->enum('delivered_status', ['not_delivered', 'delivered'])->default('not_delivered')->index();
            $table->text('delivered_remark')->nullable();
            $table->date('delivered_date')->nullable();

            // Issue details
            $table->string('issued_to')->nullable();
            $table->string('issued_department')->nullable();
            $table->enum('issued_status', ['not_issued', 'issued'])->default('not_issued')->index();
            $table->text('issued_remark')->nullable();
            $table->date('issued_date')->nullable();

            // Approval details
            $table->string('approved_by')->nullable();
            $table->string('approved_name')->nullable();
            $table->string('approved_dept')->nullable();
            $table->enum('approved_status', ['not_approved', 'approved', 'rejected'])->default('not_approved')->index();
            $table->text('approved_remark')->nullable();
            $table->date('approved_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_issues');
    }
};
