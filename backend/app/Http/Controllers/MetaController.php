<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Brand;

class MetaController extends Controller
{
    /**
     * GET all categories
     */
    public function categoriesIndex()
    {
        return response()->json(Category::orderBy('name')->get());
    }

    /**
     * GET all brands
     */
    public function brandsIndex()
    {
        return response()->json(Brand::orderBy('name')->get());
    }

    /**
     * CREATE new category
     */
    public function categoriesStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    /**
     * CREATE new brand
     */
    public function brandsStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:brands,name',
        ]);

        $brand = Brand::create($validated);

        return response()->json($brand, 201);
    }

    /**
     * UPDATE category
     */
    public function categoriesUpdate(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    /**
     * UPDATE brand
     */
    public function brandsUpdate(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:brands,name,' . $brand->id,
        ]);

        $brand->update($validated);

        return response()->json($brand);
    }

    /**
     * DELETE category
     */
    public function categoriesDestroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }

    /**
     * DELETE brand
     */
    public function brandsDestroy(Brand $brand)
    {
        $brand->delete();
        return response()->json(['message' => 'Brand deleted successfully']);
    }
}
