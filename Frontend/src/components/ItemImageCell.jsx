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
    : "/images/default-item.png";

  return (
    <>
      <img
        src={imageUrl}
        alt={itemName}
        className="w-12 h-12 object-cover rounded cursor-pointer border"
        onClick={() => setOpen(true)}
        onError={(e) => (e.currentTarget.src = "/images/default-item.png")}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {imgs.length > 0 ? (
              imgs.map((img, i) => (
                <img
                  key={i}
                  src={`${baseUrl}/storage/${img}`}
                  className="w-full h-40 object-cover rounded border"
                />
              ))
            ) : (
              <img
                src="/images/default-item.png"
                className="w-full h-40 object-cover rounded border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
