<?php

// app/Console/Commands/StoreSimpleDailyProgress.php

namespace App\Http\Controllers;

use Illuminate\Console\Command;

class StoreSimpleDailyProgress extends Command
{
    protected $signature = 'progress:store-simple';

    protected $description = 'Store average progress for each job using raw API response';
}
