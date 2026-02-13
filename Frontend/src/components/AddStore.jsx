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
import { useNavigate } from "react-router-dom";

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
  // State for invoice image
  const [invoiceImageFile, setInvoiceImageFile] = useState(null);

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
      initial_stock: "",
      low_stock: "",
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
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Create FormData
      const fd = new FormData();

      // Append all fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value);
        }
      });

      // Append images
      images.forEach((file) => fd.append("images[]", file));

      // Product images
      images.forEach((file) => fd.append("images[]", file));

      // Invoice image (if with receipt)
      if (data.purchase_type === "with_receipt" && invoiceImageFile) {
        fd.append("invoice_image", invoiceImageFile);
      }
      // Send POST request
      const res = await api.post("/items", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Success feedback: auto-close popup after 2.5s
      Swal.fire({
        icon: "success",
        title: "Item Added",
        html: `Item "<strong>${res.data.item.item_name}</strong>" has been added successfully!`,
        timer: 2500, // Auto-close after 2.5 seconds
        showConfirmButton: false, // No button
        allowOutsideClick: false, // Disable click to close
        allowEscapeKey: false,
        didClose: () => {
          // Navigate automatically after popup closes
          navigate("/inventory/total-items");
        },
      });

      fetchItems();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add item:", err?.response?.data || err);

      // Extract server-side validation errors
      let message = "Failed to add item. Please check your input.";
      if (err?.response?.data) {
        if (err.response.data.errors) {
          const errors = Object.values(err.response.data.errors)
            .flat()
            .join("<br/>");
          message = errors || message;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        }
      }

      // Show user-friendly Swal error (clickable)
      await Swal.fire({
        icon: "error",
        title: "Oops! 😅",
        html: `
    <div class="text-sm text-gray-700 mt-2">
      ${message}
    </div>
  `,
        showConfirmButton: true,
        confirmButtonText: "Got it",
        allowOutsideClick: true, // Click outside to close
        allowEscapeKey: true, // Escape key to close
        timer: 4000, // Auto-close after 4 seconds
        timerProgressBar: true, // Shows countdown bar
        backdrop: `
    rgba(0,0,0,0.6)
  `,
        buttonsStyling: false,
        customClass: {
          popup: "rounded-2xl p-6 border-2 border-red-500",
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg",
        },
        didOpen: () => {
          // Ensure it stays on top of other modals
          const popup = document.querySelector(".swal2-popup");
          popup.style.zIndex = 99999;
        },
      });
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
                        <Input type="number" {...register("initial_stock")} />
                      </div>

                      <div>
                        <Label>Low Stock Alert</Label>
                        <Input type="number" {...register("low_stock")} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* ================= PURCHASE ================= */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🧾 Purchase Information</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Purchase Type */}
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

                      {/* Purchase Price */}
                      <div>
                        <Label>Purchase Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register("purchase_price")}
                        />
                      </div>

                      {/* WITH RECEIPT SECTION */}
                      <AnimatePresence>
                        {watch("purchase_type") === "with_receipt" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border rounded-xl bg-muted/30"
                          >
                            {/* Receipt Unit Price */}
                            <div>
                              <Label>Receipt Unit Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                {...register("purchase_receipt_price")}
                              />
                            </div>

                            {/* Invoice Number */}
                            <div>
                              <Label>Invoice Number</Label>
                              <Input
                                type="text"
                                {...register("invoice_number")}
                                placeholder="Enter invoice number"
                              />
                            </div>

                            {/* Invoice Date */}
                            <div>
                              <Label>Invoice Date</Label>
                              <Input
                                type="date"
                                {...register("invoice_date")}
                              />
                            </div>

                            {/* Invoice Image */}
                            <div>
                              <Label>Invoice Image</Label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  setInvoiceImageFile(file);
                                  setValue("invoice_image", file); // optional if using FormData directly
                                }}
                              />
                            </div>
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
