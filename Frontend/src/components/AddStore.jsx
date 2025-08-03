import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { IoAdd } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";
// shadcn/ui imports
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const formFields = [
  { label: "Item Code", field: "code", disabled: true },
  { label: "Description", field: "description" },
  { label: "Part Number", field: "part_number" },
  { label: "Brand", field: "brand" },
  { label: "Model", field: "model" },
  { label: "Location", field: "location" },
  { label: "Item Name", field: "item_name" },
  { label: "Unit", field: "unit" },
  { label: "Purchase Price", field: "purchase_price", type: "number" },
  { label: "Selling Price", field: "selling_price", type: "number" },
  { label: "Least Price", field: "least_price", type: "number" },
  { label: "Maximum Price", field: "maximum_price", type: "number" },
  { label: "Minimum Quantity", field: "minimum_quantity", type: "number" },
  { label: "Low Quantity", field: "low_quantity", type: "number" },
  { label: "Manufacturer", field: "manufacturer" },
  { label: "Manufacturing Date", field: "manufacturing_date", type: "date" },
];

const AddStore = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    description: "",
    part_number: "",
    quantity: 0,
    brand: "",
    model: "",
    condition: "New",
    unit_price: 0,
    total_price: 0,
    location: "",
    item_name: "",
    unit: "",
    purchase_price: 0,
    selling_price: 0,
    least_price: 0,
    maximum_price: 0,
    minimum_quantity: 0,
    low_quantity: 0,
    manufacturer: "",
    manufacturing_date: Date,
  });

  console.log(item);

  const { showModal, setShowModal } = useStores();
  const handleChange = (field, value) => {
    setItem((prev) => {
      let updatedItem = { ...prev, [field]: value };

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
        updatedItem[field] = value ? Number(value) : 0;
      }

      // Recalculate total price if unit_price or quantity changes
      updatedItem.total_price = (
        updatedItem.unit_price * updatedItem.quantity
      ).toFixed(2);

      return updatedItem;
    });
  };

  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setItem((prev) => ({ ...prev, image: file }));
  //   }
  // };

  const handleSubmit = async () => {
    setLoading(true);

    // Auto-generate a unique code (e.g., using UUID, or customize format)
    const generatedCode = uuidv4().slice(0, 8).toUpperCase(); // Short unique code

    // Validate required fields
    if (!item.description || !item.quantity || !item.unit_price) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const itemWithCode = {
      ...item,
      code: generatedCode,
    };

    try {
      console.log("Sending Data:", itemWithCode); // Debug log

      const response = await api.post("/items", itemWithCode);

      console.log("Response Data:", response.data); // Debug log

      toast.success("Item added successfully!");

      // Reset form
      setItem({
        description: "",
        part_number: "",
        quantity: "",
        brand: "",
        model: "",
        condition: "New",
        unit_price: "",
        total_price: 0,
        location: "",
      });

      setShowModal(false);
      navigate("/inventory/total-items");
    } catch (error) {
      console.error(
        "API Error:",
        error.response ? error.response.data : error.message
      );
      toast.error(
        "Error: " + (error.response?.data?.message || "Something went wrong!")
      );
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
                <CardTitle className="text-lg font-bold uppercase tracking-wider">Add Store Item</CardTitle>
              </div>
              {/* <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} aria-label="Close">
                <IoMdClose size={24} />
              </Button> */}
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              {/* Form Fields */}
              <div className="grid gap-4">
                {formFields.map(({ label, field, type, disabled }) => (
                  <div key={field}>
                    <Label htmlFor={field} className="mb-1 block">{label}</Label>
                    <Input
                      id={field}
                      type={type || "text"}
                      value={item[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                ))}


              <div>
                <Label htmlFor="quantity" className="font-semibold">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="unit_price" className="font-semibold">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => handleChange("unit_price", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="condition" className="font-semibold">Condition</Label>
                <Select value={item.condition} onValueChange={(value) => handleChange("condition", value)}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="total_price" className="font-semibold">Total Price</Label>
                <Input
                  id="total_price"
                  type="text"
                  value={item.total_price}
                  disabled
                />
              </div>
            </div>

            {/* Action Buttons */}
            <CardFooter className="flex justify-end gap-2 mt-6 p-0">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
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
};

export default AddStore;
