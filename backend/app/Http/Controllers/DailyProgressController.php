<?php

// app/Console/Commands/StoreSimpleDailyProgress.php

namespace App\Http\Controllers;

class DailyProgressController extends Controller
{
    protected $signature = 'progress:store-simple';

    protected $description = 'Store average progress for each job using raw API response';
}
