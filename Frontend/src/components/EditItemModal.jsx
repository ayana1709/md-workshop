import React, { useState, useEffect } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { useStores } from "../contexts/storeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

export default function EditItemModal({ open, setOpen, item, itemCode }) {
  // const { id } = useParams();
  const navigate = useNavigate();
  // const { fetchItems } = useStores();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [invoiceImageFile, setInvoiceImageFile] = useState(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm();

  /* ================= FETCH ITEM ================= */
  useEffect(() => {
    fetchItem();
  }, [itemCode]);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/items/${itemCode}`);
      const itemData = res.data;

      reset(itemData);

      const parsedImages =
        typeof itemData.images === "string"
          ? JSON.parse(itemData.images)
          : itemData.images || [];

      setExistingImages(parsedImages);
    } catch (err) {
      // toast.error("Failed to load item");
    }
  };

  /* ================= IMAGE HANDLING ================= */

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  /* ================= UPDATE SUBMIT ================= */

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const fd = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value);
        }
      });

      images.forEach((file) => fd.append("images[]", file));

      if (invoiceImageFile) {
        fd.append("invoice_image", invoiceImageFile);
      }

      await api.post(`/items/${itemCode}?_method=PUT`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Item Updated Successfully",
        timer: 2000,
        showConfirmButton: false,
        didClose: () => navigate("/inventory/total-items"),
      });

      fetchItems();
    } catch (err) {
      // toast.error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="rounded-none">
            <CardHeader className="border-b bg-muted/40">
              <CardTitle>✏️ Update Product</CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-8 p-6">
                {/* ================= ABOUT ITEM ================= */}
                <Card>
                  <CardHeader>
                    <CardTitle>📦 About Item</CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Existing Images */}
                    <div className="md:col-span-2">
                      <Label>Existing Images</Label>
                      <div className="flex gap-3 flex-wrap mt-2">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative w-24 h-24">
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
                            >
                              ✕
                            </button>
                            <img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover rounded border"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upload New Images */}
                    <div className="md:col-span-2">
                      <Label>Add New Images</Label>
                      <input
                        type="file"
                        multiple
                        onChange={handleImagesChange}
                      />
                    </div>

                    <div>
                      <Label>Item Code</Label>
                      <Input disabled {...register("item_code")} />
                    </div>

                    <div>
                      <Label>Item Name</Label>
                      <Input {...register("item_name")} />
                    </div>

                    <div>
                      <Label>Part Number</Label>
                      <Input {...register("part_number")} />
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
                  {loading ? "Updating..." : "Update Product"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
