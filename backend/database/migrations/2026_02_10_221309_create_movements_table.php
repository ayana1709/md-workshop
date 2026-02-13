<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            $table->string('item_code'); // match Item primary key
            $table->unsignedBigInteger('from_branch_id');
            $table->unsignedBigInteger('to_branch_id');
            $table->string('sender_name');
            $table->string('sent_by');
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('item_code')->references('item_code')->on('items')->onDelete('cascade');
            $table->foreign('from_branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->foreign('to_branch_id')->references('id')->on('branches')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
