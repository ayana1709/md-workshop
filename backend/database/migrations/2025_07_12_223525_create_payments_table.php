<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::create('payments', function (Blueprint $table) {
        $table->id();

        // 🔹 Basic customer and reference info
        $table->date('date')->nullable();
        $table->string('name')->nullable();
        $table->string('reference')->nullable();
        $table->string('fs')->nullable();
        $table->string('mobile')->nullable();
        $table->string('tin')->nullable();
        $table->string('vat')->nullable();

        // 🔹 Payment info
        $table->enum('method', ['cash', 'transfer', 'card', 'cheque'])->default('cash');
        $table->string('status')->nullable();
        $table->decimal('paidAmount', 12, 2)->default(0);
        $table->decimal('remainingAmount', 12, 2)->default(0);
        $table->string('paidBy')->nullable();
        $table->string('approvedBy')->nullable();
        $table->string('reason')->nullable();
        $table->text('remarks')->nullable();

        // 🔹 New optional fields for transfer/cheque
        $table->string('fromBank')->nullable();
        $table->string('toBank')->nullable();
        $table->string('otherFromBank')->nullable();
        $table->string('otherToBank')->nullable();
        $table->string('chequeNumber')->nullable();
        $table->string('image')->nullable(); // file path for slip or cheque

        // 🔹 JSON fields for cost breakdowns
        $table->json('labourCosts')->nullable();
        $table->json('spareCosts')->nullable();
        $table->json('otherCosts')->nullable();
        $table->json('summary')->nullable();

        $table->timestamps();
    });
}


    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
