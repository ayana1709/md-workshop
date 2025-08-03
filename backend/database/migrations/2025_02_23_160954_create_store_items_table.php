<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoreItemsTable extends Migration
{
    public function up()
    {
        Schema::create('store_items', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            $table->string('description')->nullable();
            $table->string('partNumber')->nullable();
            $table->integer('quantity')->default(1);
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('condition')->default('New');
            $table->decimal('unitPrice', 10, 2)->default(0);
            $table->decimal('totalPrice', 10, 2)->default(0);
            $table->string('location')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('store_items');
    }
}