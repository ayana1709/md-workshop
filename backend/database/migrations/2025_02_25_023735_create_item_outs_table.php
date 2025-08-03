<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('item_outs', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('description')->nullable();
            $table->string('partNumber')->nullable();
            $table->string('plate_number');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('condition')->nullable();
            $table->integer('requestquantity');
            $table->decimal('unitPrice', 10, 2);
            $table->decimal('totalPrice', 10, 2);
            $table->string('requestedby');
            $table->date('date_out');
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('item_outs');
    }
};
