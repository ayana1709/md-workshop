<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkDetailsTable extends Migration
{
    public function up()
    {
        Schema::create('work_details', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to work_orders table
            $table->foreignId('work_order_id')->constrained()->onDelete('cascade');
    
            // $table->foreignId('employee_id')->constrained()->onDelete('cascade'); // Uncomment if needed
    
            // Work description
            $table->text('workDescription');
            
            // Labor time (make nullable if optional, or set default)
            $table->integer('laborTime')->nullable()->default(0); // Allow NULL and default to 0
    
            // Cost (make nullable if optional, or set default)
            $table->integer('cost')->nullable()->default(0); // Allow NULL and default to 0
    
            // Total cost (decimal field)
            $table->decimal('total', 10, 2)->default(0.00); // Set default value of 0.00 for clarity
    
            // Start and end dates (nullable)
            $table->date('startDate')->nullable();
            $table->date('endDate')->nullable();
    
            // Status with a default value
            $table->string('status')->default('Pending');
    
            // Timestamps for created_at and updated_at
            $table->timestamps();
        });
    }
    

   
    public function down()
    {
        Schema::dropIfExists('work_details');
    }
}
