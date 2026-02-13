import React, { useState } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Separator } from "../components/ui/separator";
import EditFieldModal from "../components/EditFieldModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import AddMoreItemModal from "./AddMoreItemModal";
import { Search, X } from "lucide-react";
import EditItemModal from "./EditItemModal";
import Swal from "sweetalert2";
import api from "@/api";
import PurchaseSellConfigModal from "./PurchaseSellConfigModal";

function ItemImageCell({ images, itemName }) {
  const [open, setOpen] = React.useState(false);
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "");
  let imgs = [];
  try {
    imgs = images ? JSON.parse(images) : [];
  } catch {}

  const firstImage = imgs[0] ?? null;
  const imageUrl = firstImage
    ? `${baseUrl}/storage/${firstImage}`
    : "/images/default.jpg";

  return (
    <>
      <img
        src={imageUrl}
        alt={itemName}
        className="w-12 h-12 object-cover rounded cursor-pointer border"
        onClick={() => setOpen(true)}
        onError={(e) => (e.currentTarget.src = "/images/default.jpg")}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {imgs.length > 0 ? (
              imgs.map((img, i) => (
                <img
                  key={i}
                  src={
                    img.startsWith("http") ? img : `${baseUrl}/storage/${img}`
                  }
                  className="w-full h-60 object-cover rounded border"
                />
              ))
            ) : (
              <img
                src="/images/default.jpg"
                className="w-full h-60 object-cover rounded border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns = ({
  selectedRows,
  setSelectedRows,
  fetchItems,
  printRef,
  setItems,
  isEditOpen,
  setIsEditOpen,
  selectedItem,
  setSelectedItem,
  setIsItemModalOpen,
  setSelectedRepairId,
}) => [
  {
    id: "select",
    header: ({ table }) => {
      const allItems = table.getRowModel().rows.map((r) => r.original);
      const allSelected =
        allItems.length > 0 &&
        allItems.every((item) =>
          selectedRows.some((s) => s.item_code === item.item_code),
        );

      return (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(value) => {
            setSelectedRows(value ? allItems : []);
          }}
        />
      );
    },

    cell: ({ row }) => {
      const item = row.original;
      const isChecked = selectedRows.some(
        (s) => s.item_code === item.item_code,
      );

      return (
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => {
            setSelectedRows((prev) =>
              prev.some((s) => s.item_code === item.item_code)
                ? prev.filter((s) => s.item_code !== item.item_code)
                : [...prev, item],
            );
          }}
        />
      );
    },

    enableSorting: false,
    enableHiding: false,
  },

  {
    id: "image",
    header: "Image",
    cell: ({ row }) => (
      <ItemImageCell
        images={row.original.images}
        itemName={row.original.item_name}
      />
    ),
  },
  ,
  {
    accessorKey: "item_code",
    header: "Item Code",
    cell: ({ row }) => (
      <span>{String(row.original.item_code).padStart(4, "0")}</span>
    ),
  },

  // ITEM NAME
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => (
      <span className="truncate">{row.original.item_name}</span>
    ),
  },

  // PART NUMBER
  {
    accessorKey: "part_number",
    header: "Part Number",
    cell: ({ row }) => <span>{row.original.part_number || "N/A"}</span>,
  },

  // CATEGORY NAME
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <span>{row.original.category?.name || "N/A"}</span>,
  },

  // BRAND NAME
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => <span>{row.original.brand?.name || "N/A"}</span>,
  },

  // BRANCH NAME
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => <span>{row.original.branch?.name || "N/A"}</span>,
  },

  // UNIT
  { accessorKey: "unit", header: "Unit" },

  // QUANTITY (sum of purchases)
  {
    accessorKey: "initial_stock",
    header: "Quantity",
    cell: ({ row }) => {
      return <span>{row.original.initial_stock ?? 0}</span>;
    },
  },

  { accessorKey: "low_stock", header: " Stock Alert" },

  // LOCATION
  { accessorKey: "location", header: "Location" },
  { accessorKey: "selling_price", header: "Selling Price" },

  // STATUS
  {
    id: "stock_status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded text-white text-xs font-semibold ${
          row.original.stock_status === "available"
            ? "bg-green-500"
            : row.original.stock_status === "low_stock"
              ? "bg-yellow-500"
              : "bg-red-500"
        }`}
      >
        {row.original.stock_status}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const [isViewOpen, setIsViewOpen] = useState(false);
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isHistoryOpen, setIsHistoryOpen] = useState(false);
      const [isConfigOpen, setIsConfigOpen] = useState(false);
      const [selectedItem, setSelectedItem] = useState(null);

      // Print QR with user inputs for size and quantity
      // Print QR with user inputs for size and quantity
      const printQr = async () => {
        const qrPath = row.original.qr_code;
        if (!qrPath) return alert("QR code not available!");

        const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "");

        const fullQrUrl = qrPath.startsWith("http")
          ? qrPath
          : `${baseUrl}/storage/${qrPath}`;

        const defaultQuantity =
          Number(row.original.quantity || row.original.initial_stock) || 1;

        const { value } = await Swal.fire({
          title: "QR Print Settings",
          html: `
      <input id="w" class="swal2-input" type="number" value="150" placeholder="Width (px)">
      <input id="h" class="swal2-input" type="number" value="150" placeholder="Height (px)">
      <input id="q" class="swal2-input" type="number" value="${defaultQuantity}" placeholder="Quantity">
    `,
          showCancelButton: true,
          preConfirm: () => ({
            width: +document.getElementById("w").value || 150,
            height: +document.getElementById("h").value || 150,
            quantity: +document.getElementById("q").value || defaultQuantity,
          }),
        });
        if (!value) return;
        const { width, height, quantity } = value;
        const win = window.open("", "_blank");
        win.document.write(`
    <html>
      <head>
        <title>Print QR</title>
        <style>
          body {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding: 20px;
            font-family: Arial, sans-serif;
          }

          .qr-card {
            width: ${width + 20}px;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
            box-sizing: border-box;
            page-break-inside: avoid;
          }

          .qr-card img {
            width: ${width}px;
            height: ${height}px;
            object-fit: contain;
          }

          .item-code {
            margin-top: 6px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        </style>
      </head>

      <body>
        ${Array(quantity)
          .fill(0)
          .map(
            () => `
          <div class="qr-card">
            <img src="${fullQrUrl}" />
            <div class="item-code">Item Code: ${row.original.item_code}</div>
          </div>
        `,
          )
          .join("")}

        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
        win.document.close();
      };
      return (
        <div className="relative">
          <Button size="sm" onClick={() => setOpen((prev) => !prev)}>
            Action <IoMdArrowDropdown className="ml-1" />
          </Button>
          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-md border flex flex-col z-50">
              {/* Print QR */}
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-600"
                onClick={async () => {
                  await printQr();
                  setOpen(false);
                }}
              >
                🖨️ Print QR
              </Button>
              {/* View */}
              {/* <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={() => {
                  setIsViewOpen(true);
                  setOpen(false);
                }}
              >
                👁️ View
              </Button> */}
              {/* Edit */}
              <Button
                className="w-full justify-start"
                onClick={() => {
                  setSelectedItem(row.original);
                  setIsEd;

                  itOpen(true);
                  setOpen(false);
                }}
              >
                ✏️ Edit
              </Button>
              {/* Purchase & Sell Config */}
              <Button
                variant="ghost"
                className="w-full justify-start text-green-700"
                onClick={() => {
                  setSelectedItem(row.original);
                  setIsConfigOpen(true);
                  setOpen(false);
                }}
              >
                ⚙️ Purchase & Sell Config
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-red-600"
                onClick={async () => {
                  const itemCode = row.original.item_code;

                  const result = await Swal.fire({
                    title: "Delete Item?",
                    text: `Item ${itemCode} will be permanently deleted.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (!result.isConfirmed) return;

                  try {
                    // ✅ Direct API call
                    await api.delete(`/items/${itemCode}`);

                    await Swal.fire({
                      icon: "success",
                      title: "Deleted!",
                      text: "Item deleted successfully.",
                      timer: 1500,
                      showConfirmButton: false,
                    });

                    // ✅ Refresh table
                    if (fetchItems) fetchItems();

                    // ✅ Close dropdown
                    setOpen(false);
                  } catch (error) {
                    console.error("Delete error:", error);

                    Swal.fire({
                      icon: "error",
                      title: "Delete Failed",
                      text:
                        error.response?.data?.message ||
                        "Failed to delete item",
                    });
                  }
                }}
              >
                🗑️ Delete
              </Button>

              {/* Item History */}
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={() => {
                  setIsHistoryOpen(true);
                  setOpen(false);
                }}
              >
                📜 Item History
              </Button>
            </div>
          )}

          {/* View Modal */}
          {isViewOpen && (
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
              <DialogContent
                className="max-w-2xl max-h-[80vh] overflow-y-auto"
                aria-describedby="item-details-description"
              >
                <p id="item-details-description" className="sr-only">
                  View item details including images, category, and pricing.
                </p>

                {/* Header */}
                <div className="border-b pb-3 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Item Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Code: {row.original.item_code}
                  </p>
                </div>

                {/* Body */}
                <div className="space-y-4 text-sm">
                  {/* Basic Info */}
                  <Detail label="Item Name" value={row.original.item_name} />
                  <Detail
                    label="Part Number"
                    value={row.original.part_number}
                  />
                  <Detail label="Unit" value={row.original.unit} />
                  <Detail label="Location" value={row.original.location} />

                  {/* Relations */}
                  <Detail
                    label="Category"
                    value={row.original.category?.name}
                  />
                  <Detail label="Brand" value={row.original.brand?.name} />
                  <Detail label="Branch" value={row.original.branch?.name} />

                  {/* Pricing */}
                  <Detail
                    label="Selling Price"
                    value={
                      row.original.selling_price
                        ? `${row.original.selling_price} ETB`
                        : "N/A"
                    }
                  />
                  <Detail
                    label="Low Stock Alert"
                    value={row.original.low_stock}
                  />

                  {/* Status */}
                  <Detail
                    label="Stock Status"
                    value={row.original.stock_status}
                  />

                  {/* Images */}
                  {row.original.images && row.original.images.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Images:</span>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {row.original.images.map((img, i) => (
                          <img
                            key={i}
                            src={`${import.meta.env.VITE_API_URL}/storage/${img}`}
                            alt="item"
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-right">
                  <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Modal */}
          {selectedItem && (
            <EditItemModal
              open={isEditOpen}
              setOpen={setIsEditOpen}
              item={selectedItem}
              itemCode={selectedItem.item_code} // ✅ ADD THIS
              onSave={(updatedData) => {
                fetchItems();
              }}
            />
          )}

          {isConfigOpen && selectedItem && (
            <PurchaseSellConfigModal
              open={isConfigOpen}
              setOpen={setIsConfigOpen}
              item={selectedItem}
            />
          )}

          {/* History Modal */}
          {isHistoryOpen && (
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Item History - {row.original.item_name}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-2">
                  {row.original.history?.length > 0 ? (
                    row.original.history.map((h, i) => (
                      <div key={i} className="text-sm border-b py-1">
                        <div>Date: {h.date}</div>
                        <div>Quantity: {h.quantity}</div>
                        <div>Price: {h.price}</div>
                        <div>Edited by: {h.staff || "N/A"}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No history available.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsHistoryOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      );
    },
  },
];
