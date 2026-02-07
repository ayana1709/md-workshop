import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../api";
import { toast } from "react-toastify";
import { useStores } from "../contexts/storeContext";
import { IoAdd } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Swal from "sweetalert2";

export default function AddStore() {
  const { showModal, setShowModal, fetchItems } = useStores();
  const [loading, setLoading] = useState(false);

  /* ---------- popups ---------- */
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openBrandModal, setOpenBrandModal] = useState(false);
  /* ---------- images ---------- */
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- categories, brands & departments ---------- */
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      item_code: "",
      item_name: "",
      part_number: "",
      category_id: "",
      new_category: "",
      brand_id: "",
      new_brand: "",
      unit: "pcs",
      location: "",
      quantity: "",
      low_quantity: "",
      purchase_type: "without_receipt",
      purchase_price: "",
      purchase_receipt_price: "",
      selling_price: "",
      branch_id: "",
    },
  });

  /* ---------- init ---------- */
  useEffect(() => {
    setValue("item_code", uuidv4().slice(0, 8).toUpperCase());
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      setLoadingDepartments(true);
      const [catRes, brandRes, deptRes] = await Promise.all([
        api.get("/categories"),
        api.get("/brands"),
        api.get("/departments"),
      ]);

      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);

      // Default select first department if exists
      if (deptRes.data?.length > 0) {
        setValue("branch_id", String(deptRes.data[0].id));
      }
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
      toast.error("Failed to load categories, brands, or departments");
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      const res = await api.post("/categories", { name });
      setCategories((p) => [...p, res.data]);
      setValue("category_id", String(res.data.id));
      setOpenCategoryModal(false);
      toast.success("Category added");
    } catch {
      toast.error("Failed to add category");
    }
  };

  /* ===================================================== */
  /* ADD BRAND */
  /* ===================================================== */

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      const res = await api.post("/brands", { name });
      setBrands((p) => [...p, res.data]);
      setValue("brand_id", String(res.data.id));
      setOpenBrandModal(false);
      toast.success("Brand added");
    } catch {
      toast.error("Failed to add brand");
    }
  };

  /* ---------- submit ---------- */

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Create FormData
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      images.forEach((img) => fd.append("images[]", img));

      // Convert FormData to plain object for display
      const payload = {};
      fd.forEach((value, key) => {
        // If multiple images, show only names
        if (value instanceof File) {
          if (!payload[key]) payload[key] = [];
          payload[key].push(value.name);
        } else {
          payload[key] = value;
        }
      });

      // Show payload in Swal2 popup
      // await Swal.fire({
      //   title: "Form Payload",
      //   html: `<pre style="text-align:left">${JSON.stringify(payload, null, 2)}</pre>`,
      //   width: 600,
      // });

      // Uncomment this to actually send the data later
      await api.post("/items", fd);
      toast.success("Item added successfully");
      fetchItems();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add item:", err);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="rounded-none">
              <CardHeader className="border-b bg-muted/40">
                <div className="flex items-center gap-3">
                  <IoAdd size={22} />
                  <CardTitle>Add New Product</CardTitle>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-8 p-6">
                  {/* ================= DEPARTMENT ================= */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🏢 Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingDepartments ? (
                        <p>Loading branch...</p>
                      ) : departments.length === 0 ? (
                        <p className="text-red-500">No branch available</p>
                      ) : (
                        <Select onValueChange={(v) => setValue("branch_id", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </CardContent>
                  </Card>

                  {/* ================= ABOUT ITEM ================= */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📦 About Item</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Images */}
                      <div className="space-y-2 md:col-span-2">
                        <Label>Product Images</Label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImagesChange}
                          className="block w-full"
                        />
                        <div className="flex gap-3 flex-wrap mt-2">
                          {previews.map((src, index) => (
                            <div
                              key={index}
                              className="relative w-24 h-24 rounded border overflow-hidden"
                            >
                              {index === 0 && (
                                <span className="absolute top-1 left-1 bg-black text-white text-xs px-1 rounded z-10">
                                  Default
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center z-10"
                              >
                                ✕
                              </button>
                              <img
                                src={src}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Item Code</Label>
                        <Input disabled {...register("item_code")} />
                      </div>

                      <div>
                        <Label>Item Name *</Label>
                        <Input {...register("item_name", { required: true })} />
                      </div>

                      <div>
                        <Label>Part Number</Label>
                        <Input {...register("part_number")} />
                      </div>

                      {/* CATEGORY */}
                      <div>
                        <Label>Category</Label>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(v) => setValue("category_id", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={() => setOpenCategoryModal(true)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Brand</Label>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(v) => setValue("brand_id", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={() => setOpenBrandModal(true)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Unit */}
                      <div>
                        <Label>Unit</Label>
                        <Select
                          defaultValue="pcs"
                          onValueChange={(v) => setValue("unit", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="box">box</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Location</Label>
                        <Input {...register("location")} />
                      </div>

                      <div>
                        <Label>Initial Stock</Label>
                        <Input type="number" {...register("quantity")} />
                      </div>

                      <div>
                        <Label>Low Stock Alert</Label>
                        <Input type="number" {...register("low_quantity")} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* ================= PURCHASE ================= */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🧾 Purchase Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label>Purchase Type</Label>
                        <Select
                          defaultValue="without_receipt"
                          onValueChange={(v) => setValue("purchase_type", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="with_receipt">
                              With Receipt
                            </SelectItem>
                            <SelectItem value="without_receipt">
                              Without Receipt
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Purchase Price</Label>
                        <Input type="number" {...register("purchase_price")} />
                      </div>

                      <AnimatePresence>
                        {watch("purchase_type") === "with_receipt" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="md:col-span-2"
                          >
                            <Label>Receipt Price</Label>
                            <Input
                              type="number"
                              {...register("purchase_receipt_price")}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  {/* ================= SELLING ================= */}
                  <Card>
                    <CardHeader>
                      <CardTitle>💰 Selling Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label>Selling Price</Label>
                      <Input type="number" {...register("selling_price")} />
                    </CardContent>
                  </Card>
                </CardContent>

                <Separator />

                <CardFooter className="justify-end p-6">
                  <Button disabled={loading}>
                    {loading ? "Saving..." : "Save Product"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </DialogContent>
      </Dialog>
      <Dialog open={openCategoryModal} onOpenChange={setOpenCategoryModal}>
        <DialogContent>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <CardTitle>Add Category</CardTitle>
            <Input name="name" placeholder="Category name" required />
            <Button>Add</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= BRAND POPUP ================= */}
      <Dialog open={openBrandModal} onOpenChange={setOpenBrandModal}>
        <DialogContent>
          <form onSubmit={handleAddBrand} className="space-y-4">
            <CardTitle>Add Brand</CardTitle>
            <Input name="name" placeholder="Brand name" required />
            <Button>Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
