import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { IoAdd, IoChevronDown } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
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

/**
 * NOTES:
 * - Add global CSS snippet (below) to hide number input spinners.
 * - Tailwind must be available.
 * - This uses react-hook-form to validate only mounted fields (shouldUnregister: true).
 */

export default function AddStore() {
  const navigate = useNavigate();
  const { showModal, setItems, setShowModal, fetchItems } = useStores();

  const [loading, setLoading] = useState(false);

  const placeholderImage = "../../public/images/default.jpg";
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(placeholderImage);

  // UI toggles for collapsible sub-sections
  const [showPriceExtras, setShowPriceExtras] = useState(false);
  const [showLowQty, setShowLowQty] = useState(false);
  const [showOther, setShowOther] = useState(false);

  // react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    shouldUnregister: true, // IMPORTANT: unmounting fields unregisters them -> only visible fields validate
    defaultValues: {
      code: "",
      item_name: "",
      part_number: "",
      unit: "",
      unit_price: "",
      purchase_price: "",
      selling_price: "",
      quantity: "",
      low_quantity: "",
      least_price: "",
      maximum_price: "",
      location: "",
      brand: "",
      model: "",
      manufacturer: "",
      manufacturing_date: new Date().toISOString().split("T")[0],
      condition: "New",
    },
  });

  // compute total live: total_price = unit_price * quantity
  const watchedUnitPrice = watch("unit_price");
  const watchedQuantity = watch("quantity");
  useEffect(() => {
    const unit = Number(watchedUnitPrice) || 0;
    const qty = Number(watchedQuantity) || 0;
    const total = (unit * qty).toFixed(2);
    setValue("total_price", total);
  }, [watchedUnitPrice, watchedQuantity, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // assume your store has setItems or similar

  const onSubmit = async (formDataRaw) => {
    setLoading(true);
    try {
      const generatedCode = uuidv4().slice(0, 8).toUpperCase();
      const fd = new FormData();

      // Append all text fields
      Object.entries({ ...formDataRaw, code: generatedCode }).forEach(
        ([k, v]) => fd.append(k, v ?? "")
      );

      // Handle image: use uploaded file or default image
      if (imageFile) {
        fd.append("image", imageFile);
      } else {
        const defaultImagePath = "/images/default.jpg"; // public folder path
        const response = await fetch(defaultImagePath);
        const blob = await response.blob();
        fd.append("image", blob, "default.jpg");
      }

      await api.post("/items", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item Added!");
      await fetchItems();
      setShowModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "There was an error!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setValue("manufacturing_date", new Date().toISOString().split("T")[0]);
  }, [setValue]);

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ y: -16, opacity: 0, scale: 0.995 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Card className="rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <IoAdd size={28} className="text-blue-600" />
                <CardTitle className="text-lg font-extrabold uppercase">
                  Add Store Item
                </CardTitle>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6 bg-white">
                {/* Item Image */}

                <div>
                  <Label className="mb-2 font-bold flex items-center gap-2">
                    📷 Item Image
                  </Label>

                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-36 h-36 object-cover rounded-md border border-gray-300"
                  />

                  <div className="flex gap-2 mt-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                      📁 Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {(imagePreview || imageFile) && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Item Code */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    🏷️ Item Code
                  </Label>
                  <Input
                    {...register("******")}
                    placeholder="*******"
                    disabled
                    className="font-bold bg-gray-50 border-gray-700"
                  />
                </div>

                {/* Item Name */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    📝 Item Name
                  </Label>
                  <Input
                    {...register("item_name", {
                      required: "Item Name is required",
                    })}
                    placeholder="Enter item name"
                    className={` ${
                      errors.item_name ? "border-red-500" : "border-gray-700"
                    }`}
                  />

                  {errors.item_name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.item_name.message}
                    </p>
                  )}
                </div>

                {/* Part Number */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    🔢 Part Number
                  </Label>
                  <Input
                    {...register("part_number")}
                    placeholder="Enter part number"
                    className="border-gray-700"
                  />
                </div>

                {/* Brand */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    🏭 Brand
                  </Label>
                  <Input
                    {...register("brand")}
                    placeholder="Brand name"
                    className="border-gray-700"
                  />
                </div>

                {/* Unit */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    📦 Unit
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("unit", value)} // set form value
                    defaultValue={watch("unit") || ""} // show current value
                  >
                    <SelectTrigger className="border border-gray-300">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="box">box</SelectItem>
                      <SelectItem value="pack">pack</SelectItem>
                      <SelectItem value="set">set</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Price */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    💰 Unit Price
                  </Label>
                  <Input
                    type="number"
                    {...register("unit_price", {
                      required: "Unit price is required",
                      min: { value: 0, message: "Unit price ≥ 0" },
                    })}
                    placeholder="0.00"
                    className={`no-spinner ${
                      errors.unit_price ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  {errors.unit_price && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.unit_price.message}
                    </p>
                  )}
                </div>

                {/* Purchase Price */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    🛒 Purchase Price
                  </Label>
                  <Input
                    type="number"
                    {...register("purchase_price")}
                    placeholder="0.00"
                    className="border-gray-700 no-spinner"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    💵 Selling Price
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      {...register("selling_price", {
                        required: "Selling price required",
                      })}
                      placeholder="0.00"
                      className={`flex-1 no-spinner ${
                        errors.selling_price
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => setShowPriceExtras((s) => !s)}
                    >
                      <FiPlus />
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showPriceExtras && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="mt-3 grid grid-cols-2 gap-2"
                      >
                        <div>
                          <Label className="mb-1 font-bold flex items-center gap-2">
                            💲 Least Price
                          </Label>
                          <Input
                            type="number"
                            {...register("least_price")}
                            placeholder="0.00"
                            className="border-gray-700 no-spinner"
                          />
                        </div>
                        <div>
                          <Label className="mb-1 font-bold flex items-center gap-2">
                            💲 Maximum Price
                          </Label>
                          <Input
                            type="number"
                            {...register("maximum_price")}
                            placeholder="0.00"
                            className="border-gray-700 no-spinner"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    🔢 Quantity
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      {...register("quantity", {
                        required: "Quantity required",
                        min: { value: 0, message: "Quantity ≥ 0" },
                      })}
                      placeholder="0"
                      className={`no-spinner ${
                        errors.quantity ? "border-red-500" : "border-gray-700"
                      }`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => setShowLowQty((s) => !s)}
                    >
                      <FiPlus />
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showLowQty && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="mt-3"
                      >
                        <Label className="mb-1 font-bold flex items-center gap-2">
                          ⚠️ Low Quantity
                        </Label>
                        <Input
                          type="number"
                          {...register("low_quantity")}
                          placeholder="0"
                          className="border-gray-700 no-spinner"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location */}
                <div>
                  <Label className="mb-1 font-bold flex items-center gap-2">
                    📍 Location
                  </Label>
                  <Input
                    {...register("location")}
                    placeholder="Location"
                    className="border-gray-700"
                  />
                </div>

                {/* Other collapsible */}
                <div>
                  <Label
                    className="font-bold flex items-center justify-between cursor-pointer"
                    onClick={() => setShowOther((s) => !s)}
                  >
                    <span>⚙️ Other</span>
                    <IoChevronDown
                      className={`transition-transform ${
                        showOther ? "rotate-180" : "border-gray-700"
                      }`}
                    />
                  </Label>
                  <AnimatePresence>
                    {showOther && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="mt-3 space-y-2"
                      >
                        <Input
                          {...register("model")}
                          placeholder="Model"
                          className="border-gray-700"
                        />
                        <Input
                          {...register("manufacturer")}
                          placeholder="Manufacturer"
                          className="border-gray-700"
                        />
                        <Input
                          type="date"
                          {...register("manufacturing_date")}
                          defaultValue={new Date().toISOString().split("T")[0]} // set today's date
                          className="border-gray-700 font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center p-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
