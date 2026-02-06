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

export default function AddStore() {
  const { showModal, setShowModal, fetchItems } = useStores();
  const [loading, setLoading] = useState(false);

  const placeholderImage = "/images/default.jpg";
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(placeholderImage);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      item_code: "",
      item_name: "",
      part_number: "",
      category: "",
      brand: "",
      unit: "pcs",
      location: "",
      quantity: "",
      low_quantity: "",
      purchase_type: "without_receipt",
      purchase_price: "",
      purchase_receipt_price: "",
      selling_price: "",
    },
  });

  useEffect(() => {
    setValue("item_code", uuidv4().slice(0, 8).toUpperCase());
  }, [setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v || ""));
      if (imageFile) fd.append("image", imageFile);

      await api.post("/items", fd);
      toast.success("Item added successfully");
      fetchItems();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <IoAdd size={24} />
                <CardTitle>Add Item</CardTitle>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-5">

                {/* IMAGE */}
                <div>
                  <Label>Item Image</Label>
                  <img src={imagePreview} className="w-32 h-32 rounded border" />
                  <Input type="file" onChange={handleImageChange} />
                </div>

                {/* ITEM CODE */}
                <div>
                  <Label>Item Code</Label>
                  <Input disabled {...register("item_code")} />
                </div>

                {/* ITEM NAME */}
                <div>
                  <Label>Item Name *</Label>
                  <Input {...register("item_name", { required: true })} />
                </div>

                {/* PART NUMBER */}
                <div>
                  <Label>Part Number</Label>
                  <Input {...register("part_number")} />
                </div>

                {/* CATEGORY */}
                <div>
                  <Label>Category (Group)</Label>
                  <Input {...register("category")} />
                </div>

                {/* BRAND */}
                <div>
                  <Label>Brand</Label>
                  <Input {...register("brand")} />
                </div>

                {/* UNIT */}
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

                {/* LOCATION */}
                <div>
                  <Label>Location</Label>
                  <Input {...register("location")} />
                </div>

                {/* QUANTITY */}
                <div>
                  <Label>Quantity (Stock)</Label>
                  <Input type="number" {...register("quantity")} />
                </div>

                {/* LOW STOCK */}
                <div>
                  <Label>Low Stock</Label>
                  <Input type="number" {...register("low_quantity")} />
                </div>

                {/* PURCHASE TYPE */}
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
                      <SelectItem value="with_receipt">With Receipt</SelectItem>
                      <SelectItem value="without_receipt">
                        Without Receipt
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PURCHASE PRICE */}
                <div>
                  <Label>Purchase Price(s)</Label>
                  <Input type="number" {...register("purchase_price")} />
                </div>

                {/* PURCHASE RECEIPT PRICE */}
                <AnimatePresence>
                  {watch("purchase_type") === "with_receipt" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Label>Purchase Receipt Price</Label>
                      <Input
                        type="number"
                        {...register("purchase_receipt_price")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SELLING PRICE */}
                <div>
                  <Label>Selling Price</Label>
                  <Input type="number" {...register("selling_price")} />
                </div>

              </CardContent>

              <CardFooter className="justify-end">
                <Button disabled={loading}>
                  {loading ? "Saving..." : "Save Item"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
