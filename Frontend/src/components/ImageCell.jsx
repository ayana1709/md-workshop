// ImageCell.jsx
import { useState } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";

export default function ImageCell({ image, alt }) {
  const [openImage, setOpenImage] = useState(false);

  // Full image URL
  const imageUrl = image
    ? `${import.meta.env.VITE_API_BASE_URL}/storage/${image}`
    : "/placeholder.png";

  return (
    <>
      {/* Thumbnail */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-12 h-12 object-cover rounded cursor-pointer border"
        onClick={() => setOpenImage(true)}
      />

      {/* Popup */}
      <Dialog open={openImage} onOpenChange={setOpenImage}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[80vh] object-contain rounded"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
