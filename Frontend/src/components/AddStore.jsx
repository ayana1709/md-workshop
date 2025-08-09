import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { IoAdd } from "react-icons/io5";
import { motion } from "framer-motion";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const formFields = [
  { label: "Item Code", field: "code", disabled: true, placeholder: "***" },
  {
    label: "Item Name",
    field: "item_name",
    placeholder: "የእቃ ስም",
    required: true,
  },
  {
    label: "Purchase Price",
    field: "purchase_price",
    type: "number",
    placeholder: "የግዢ ዋጋ",
  },
  {
    label: "Selling Price",
    field: "selling_price",
    type: "number",
    placeholder: "የሽያጭ ዋጋ",
  },
  {
    label: "Quantity",
    field: "quantity",
    type: "number",
    placeholder: "ብዛት",
    required: true,
  },
  {
    label: "Least Price",
    field: "least_price",
    type: "number",
    placeholder: "አነስተኛ ዋጋ",
  },
  {
    label: "Maximum Price",
    field: "maximum_price",
    type: "number",
    placeholder: "ከፍተኛ ዋጋ",
  },
  { label: "Location", field: "location", placeholder: "አካባቢ" },
  { label: "Part Number", field: "part_number", placeholder: "የክፍል ቁጥር" },
  { label: "Brand", field: "brand", placeholder: "ብራንድ" },
  { label: "Model", field: "model", placeholder: "ሞዴል" },
  { label: "Unit", field: "unit", placeholder: "ክፍል" },
  {
    label: "Minimum Quantity",
    field: "minimum_quantity",
    type: "number",
    placeholder: "አነስተኛ ብዛት",
  },
  {
    label: "Low Quantity",
    field: "low_quantity",
    type: "number",
    placeholder: "ዝቅተኛ ብዛት",
  },
  { label: "Manufacturer", field: "manufacturer", placeholder: "አምራች" },
  {
    label: "Manufacturing Date",
    field: "manufacturing_date",
    type: "date",
    placeholder: "የማምረቻ ቀን",
  },
];

export default function AddStore() {
  const navigate = useNavigate();
  const { showModal, setShowModal } = useStores();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [item, setItem] = useState(() =>
    formFields.reduce((acc, f) => ({ ...acc, [f.field]: "" }), {
      condition: "New",
      unit_price: "",
      total_price: 0,
    })
  );

  const handleChange = (field, value) => {
    setItem((prev) => {
      const updated = { ...prev, [field]: value };
      if (
        [
          "unit_price",
          "quantity",
          "purchase_price",
          "selling_price",
          "least_price",
          "maximum_price",
          "low_quantity",
          "minimum_quantity",
        ].includes(field)
      ) {
        updated[field] = value ? Number(value) : "";
      }
      updated.total_price = (
        (updated.unit_price || 0) * (updated.quantity || 0)
      ).toFixed(2);
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    for (let field of formFields) {
      if (field.required && !item[field.field]) {
        toast.error(`Please fill in ${field.label}`);
        return false;
      }
    }
    if (!item.unit_price) {
      toast.error("Please enter the unit price");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const generatedCode = uuidv4().slice(0, 8).toUpperCase();
      const formData = new FormData();

      Object.entries({ ...item, code: generatedCode }).forEach(
        ([key, value]) => {
          formData.append(key, value);
        }
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item added successfully!");
      setItem(
        formFields.reduce((acc, f) => ({ ...acc, [f.field]: "" }), {
          condition: "New",
          unit_price: "",
          total_price: 0,
        })
      );
      setImageFile(null);
      setImagePreview(null);
      setShowModal(false);
      navigate("/inventory/total-items");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-xl p-0 bg-white dark:bg-gray-900">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <IoAdd size={28} className="text-primary" />
                <CardTitle className="text-lg font-bold uppercase tracking-wider">
                  Add Store Item
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <Label className="mb-2 font-bold">Item Image</Label>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover border rounded mb-2"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-gray-200 border rounded mb-2">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {imagePreview && (
                    <Button
                      type="button"
                      onClick={handleImageRemove}
                      variant="destructive"
                    >
                      X
                    </Button>
                  )}
                  <label className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded">
                    📂
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Dynamic Form Fields */}
              <div className="grid gap-4">
                {formFields.map(
                  ({ label, field, type, disabled, placeholder }) => (
                    <div key={field}>
                      <Label htmlFor={field} className="mb-1 block font-bold">
                        {label}
                      </Label>
                      <Input
                        id={field}
                        type={type || "text"}
                        value={item[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        disabled={disabled}
                        placeholder={placeholder}
                        className="font-bold text-black placeholder-gray-500 no-spinner"
                      />
                    </div>
                  )
                )}

                <div>
                  <Label htmlFor="unit_price" className="font-bold">
                    Unit Price
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleChange("unit_price", e.target.value)}
                    className="no-spinner font-bold text-black placeholder-gray-500"
                    placeholder="የክፍል ዋጋ"
                  />
                </div>

                <div>
                  <Label htmlFor="condition" className="font-bold">
                    Condition
                  </Label>
                  <Select
                    value={item.condition}
                    onValueChange={(value) => handleChange("condition", value)}
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="ሁኔታ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="total_price" className="font-bold">
                    Total Price
                  </Label>
                  <Input
                    id="total_price"
                    type="text"
                    value={item.total_price}
                    disabled
                    className="font-bold text-black"
                  />
                </div>
              </div>

              <CardFooter className="flex justify-end gap-2 mt-6 p-0">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Close
                </Button>
                <Button onClick={handleSubmit} disabled={loading} type="button">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
