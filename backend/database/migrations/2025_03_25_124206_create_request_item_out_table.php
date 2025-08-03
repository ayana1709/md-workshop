<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('request_item_out', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_no'); // ✅ Track Job Card
            $table->string('plate_number'); // ✅ Vehicle Plate Number
            $table->string('customer_name'); // ✅ Customer Name
            $table->string('part_number'); // ✅ Part Number
            $table->string('description')->nullable(); // ✅ Part Description
            $table->string('brand')->nullable(); // ✅ Brand of the Item
            $table->string('model')->nullable(); // ✅ Model Information
            $table->integer('request_quantity'); // ✅ Quantity Requested
            $table->string('requested_by')->nullable(); // ✅ Part Description
            $table->decimal('unit_price', 10, 2); // ✅ Price per Unit
            $table->decimal('total_price', 10, 2); // ✅ request_quantity * unit_price
            $table->string('location')->nullable(); // ✅ Where the item was stored
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending'); // ✅ Status for approval
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('request_item_out');
    }
};
