// AddStore.jsx
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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
      manufacturing_date: "",
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

      Object.entries({ ...formDataRaw, code: generatedCode }).forEach(
        ([k, v]) => fd.append(k, v ?? "")
      );
      if (imageFile) fd.append("image", imageFile);

      await api.post("/items", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item Added!");
      await fetchItems(); // refresh store list
      setShowModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "There was an error!");
    } finally {
      setLoading(false);
    }
  };

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
              {/* <div className="text-sm text-gray-500">የእቃ መታወቂያን ይዘው ያስገቡ</div> */}
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6 bg-white">
                {/* Image */}
                <div className="flex gap-6 items-start">
                  {/* Main fields (two-column responsive) */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 font-bold">Item Image </Label>
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-36 h-36 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-md border bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                          📁
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                        {imagePreview && (
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
                    {/* Code (readonly) */}
                    <div className="col-span-1 sm:col-span-2">
                      <Label className="mb-1 font-bold">Item Code</Label>
                      <Input
                        {...register("***")}
                        placeholder="***"
                        disabled
                        className="font-bold bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label className="mb-1 font-bold">Item Name</Label>
                      <Input
                        {...register("item_name", {
                          required: "የእቃ ስም ያስፈልጋል",
                        })}
                        placeholder="የእቃ ስም እዚህ ያስገቡ"
                        className={`font-bold ${
                          errors.item_name ? "border-red-500" : ""
                        }`}
                      />
                      {errors.item_name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.item_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-1 font-bold">Part Number</Label>
                      <Input
                        {...register("part_number")}
                        placeholder="ፓርት ቁጥር ያስገቡ"
                      />
                      {errors.part_number && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.part_number.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-1 font-bold">Unit</Label>
                      <Input {...register("unit")} placeholder="pcs" />
                    </div>

                    <div>
                      <Label className="mb-1 font-bold">Unit Price</Label>
                      <Input
                        type="number"
                        {...register("unit_price", {
                          required: "የአንዱ ዋጋ ያስፈልጋል",
                          min: { value: 0, message: "አንዱ ዋጋ ≥ 0 ሊሆን አለበት" },
                        })}
                        placeholder="0.00"
                        className={`no-spinner font-bold ${
                          errors.unit_price ? "border-red-500" : ""
                        }`}
                      />
                      {errors.unit_price && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.unit_price.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-1 font-bold">Purchase Price</Label>
                      <Input
                        type="number"
                        {...register("purchase_price")}
                        placeholder="0.00"
                        className="no-spinner"
                      />
                    </div>

                    {/* Selling price + toggle extras */}
                    <div className="col-span-1 sm:col-span-1">
                      <Label className="mb-1 font-bold">Selling Price</Label>
                      <div className="flex items-end gap-2">
                        <Input
                          type="number"
                          {...register("selling_price", {
                            required: "የሽያጭ ዋጋ ያስፈልጋል",
                          })}
                          placeholder="0.00"
                          className={`flex-1 no-spinner ${
                            errors.selling_price ? "border-red-500" : ""
                          }`}
                        />
                        <Button
                          type="button"
                          size="icon"
                          className="p-2"
                          onClick={() => setShowPriceExtras((s) => !s)}
                          aria-expanded={showPriceExtras}
                          aria-controls="price-extras"
                        >
                          <FiPlus />
                        </Button>
                      </div>
                      {errors.selling_price && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.selling_price.message}
                        </p>
                      )}

                      <AnimatePresence>
                        {showPriceExtras && (
                          <motion.div
                            id="price-extras"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="mt-3 grid grid-cols-2 gap-2"
                          >
                            <div>
                              <Label className="mb-1 font-bold">
                                Least Price
                              </Label>
                              <Input
                                type="number"
                                {...register("least_price")}
                                placeholder="0.00"
                                className="no-spinner"
                              />
                            </div>
                            <div>
                              <Label className="mb-1 font-bold">
                                Maximum Price
                              </Label>
                              <Input
                                type="number"
                                {...register("maximum_price")}
                                placeholder="0.00"
                                className="no-spinner"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quantity + low qty toggle */}
                    <div>
                      <Label className="mb-1 font-bold">Quantity</Label>
                      <div className="flex items-end gap-2">
                        <Input
                          type="number"
                          {...register("quantity", {
                            required: "ብዛት ያስፈልጋል",
                            min: { value: 0, message: "ብዛት ≥ 0 ሊሆን አለበት" },
                          })}
                          placeholder="0"
                          className={`no-spinner ${
                            errors.quantity ? "border-red-500" : ""
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
                      {errors.quantity && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.quantity.message}
                        </p>
                      )}

                      <AnimatePresence>
                        {showLowQty && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="mt-3"
                          >
                            <Label className="mb-1 font-bold">
                              Low Quantity
                            </Label>
                            <Input
                              type="number"
                              {...register("low_quantity")}
                              placeholder="0"
                              className="no-spinner"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <Label className="mb-1 font-bold">Location</Label>
                      <Input
                        {...register("location")}
                        placeholder="የእቃው ቦታ ያስገቡ"
                      />
                    </div>

                    {/* Other - collapsible block */}
                    <div className="col-span-1 sm:col-span-2">
                      <Label
                        className="font-bold flex items-center justify-between cursor-pointer"
                        onClick={() => setShowOther((s) => !s)}
                      >
                        <span>Other</span>
                        <IoChevronDown
                          className={`transition-transform ${
                            showOther ? "rotate-180" : ""
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
                            className="mt-3 grid grid-cols-2 gap-2"
                          >
                            <div>
                              <Label className="mb-1 font-bold">Brand</Label>
                              <Input
                                {...register("brand")}
                                placeholder="ምርት ብራንድ"
                              />
                            </div>
                            <div>
                              <Label className="mb-1 font-bold">Model</Label>
                              <Input {...register("model")} placeholder="ሞዴል" />
                            </div>
                            <div>
                              <Label className="mb-1 font-bold">
                                Manufacturer
                              </Label>
                              <Input
                                {...register("manufacturer")}
                                placeholder="አምራች"
                              />
                            </div>
                            <div>
                              <Label className="mb-1 font-bold">
                                Manufacturing Date
                              </Label>
                              <Input
                                type="date"
                                {...register("manufacturing_date")}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Total Price (readonly computed) */}
                    {/* <div className="col-span-1 sm:col-span-2">
                      <Label className="mb-1 font-bold">Total Price</Label>
                      <Input
                        {...register("total_price")}
                        placeholder="0.00"
                        disabled
                        className="bg-gray-50 font-bold"
                      />
                    </div> */}
                  </div>
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
