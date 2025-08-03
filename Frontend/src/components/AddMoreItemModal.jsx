import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useStores } from "@/contexts/storeContext";
import api from "../api";
import { toast } from "react-toastify";

export default function AddMoreItemModal({
  open,
  setOpen,
  repair,
  setDialogeOpen,
}) {
  const { items } = useStores();
  const [item, setItem] = useState({
    id: repair.id,
    item_name: repair.item_name,
    part_number: "",
    quantity: repair.quantity,
    unit_price: repair.unit_price,
    purchase_price: repair.purchase_price,
    selling_price: repair.selling_price,
    new_quantity: repair.new_quantity,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isQuantityEditing, setIsQuantityEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalQuantity = Number(item.quantity) + Number(item.new_quantity);
      const payload = { ...item, quantity: totalQuantity };
      const response = await api.post("/items/add-more", payload);
      console.log("Submitted:", response.data);
      toast.success("Item added successfully");
      setOpen(false);
      setDialogeOpen(false);
      
    } catch (error) {
      console.error("Error submitting item:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add More Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Item Name
              </label>
              <Input disabled name="item_name" value={repair.item_name} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Part Number
              </label>
              <Input
                name="part_number"
                value={item.part_number}
                onChange={handleChange}
                placeholder="Enter Part Number"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Current Quantity
              </label>
              <Input
                name="quantity"
                value={item.quantity}
                disabled={!isQuantityEditing}
                onChange={handleChange}
                className={isQuantityEditing ? "border-blue-500" : ""}
              />
              <Pencil
                onClick={() => setIsQuantityEditing(!isQuantityEditing)}
                className="absolute right-2 top-[38px] cursor-pointer h-4 w-4 text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Quantity
              </label>
              <Input
                name="new_quantity"
                value={item.new_quantity}
                onChange={handleChange}
                placeholder="Enter new quantity"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Current Unit Price
              </label>
              <Input
                name="unit_price"
                value={item.unit_price}
                disabled={!isEditing}
                onChange={handleChange}
                className={isEditing ? "border-blue-500" : ""}
              />
              <Pencil
                onClick={() => setIsEditing(!isEditing)}
                className="absolute right-2 top-[38px] cursor-pointer h-4 w-4 text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Purchase Price
              </label>
              <Input
                disabled
                name="purchase_price"
                value={repair.purchase_price}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Purchase Price
              </label>
              <Input
                name="purchase_price"
                value={item.purchase_price}
                onChange={handleChange}
                placeholder="New Purchase Price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Selling Price
              </label>
              <Input
                name="selling_price"
                value={item.selling_price}
                onChange={handleChange}
                placeholder="New Selling Price"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDialogeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
