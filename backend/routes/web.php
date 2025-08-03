<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Route::get('/', function () {
//     return view('welcome');
// });
// Route::get('/', function () {
//     return file_get_contents(public_path('index.html'));
// })->where('', '.*');
Route::get('/{any}', function () {
    $path = public_path('index.html');
    if (File::exists($path)) {
        return File::get($path);
    }
    return Response::make("File not found", 404);
})->where('any', '.*');
