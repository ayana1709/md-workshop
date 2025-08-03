<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('item_histories', function (Blueprint $table) {
            $table->id();
            $table->string('code'); // Track by item code
            $table->string('action'); // e.g., "Stored", "Updated", "Taken Out"
            $table->text('details')->nullable(); // JSON or text description
            $table->string('performed_by'); // User or admin name
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('item_histories');
    }
};
