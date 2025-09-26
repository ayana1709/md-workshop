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

            // Basic identifiers
            $table->string('jobId')->unique();

            // Customer info (flat)
            $table->string('name')->nullable();
            $table->string('mobile')->nullable();
            $table->string('plate')->nullable();
            $table->string('model')->nullable();
            $table->string('priority')->nullable();
            $table->date('receivedDate')->nullable();
            $table->date('dateOut')->nullable();

            // Payment info (flat)
            $table->string('method'); // transfer, cash, etc.
            $table->string('status'); // full, advance, etc.
            $table->decimal('paidAmount', 10, 2);
            $table->decimal('remainingAmount', 10, 2)->nullable();
            $table->string('reference')->nullable();
            $table->date('date')->nullable();
            $table->string('paidBy')->nullable();
            $table->string('approvedBy')->nullable();
            $table->string('reason')->nullable();
            $table->text('remarks')->nullable();

            // Cost arrays
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
