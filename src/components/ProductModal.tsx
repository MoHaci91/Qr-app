import { useState } from "react";
import { 
  X, 
  Upload, 
  Loader2, 
  DollarSign, 
  FileText, 
  Package,
  Image as ImageIcon,
  Box
} from "lucide-react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import QRCode from "qrcode";
import { cn } from "../lib/utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ isOpen, onClose }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [files, setFiles] = useState<{ model: File | null; image: File | null }>({
    model: null,
    image: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.model || !formData.name || !formData.price) return;

    setLoading(true);
    try {
      // 1. Upload Files
      const modelRef = ref(storage, `models/${Date.now()}_${files.model.name}`);
      await uploadBytes(modelRef, files.model);
      const modelUrl = await getDownloadURL(modelRef);

      let imageUrl = "";
      if (files.image) {
        const imageRef = ref(storage, `images/${Date.now()}_${files.image.name}`);
        await uploadBytes(imageRef, files.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // 2. Create Product in Firestore first to get ID
      const productRef = await addDoc(collection(db, "products"), {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        modelUrl,
        imageUrl,
        scanCount: 0,
        createdAt: serverTimestamp(),
      });

      // 3. Generate QR Code
      const productUrl = `${window.location.origin}/product/${productRef.id}`;
      const qrDataUrl = await QRCode.toDataURL(productUrl, {
        width: 1024,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" }
      });

      // 4. Upload QR Code to Storage
      const qrResponse = await fetch(qrDataUrl);
      const qrBlob = await qrResponse.blob();
      const qrRef = ref(storage, `qrcodes/${productRef.id}.png`);
      await uploadBytes(qrRef, qrBlob);
      const qrCodeUrl = await getDownloadURL(qrRef);

      // 5. Update Product with QR URL
      // (Actually, it's better to just store the URL in Firestore)
      // We can update the doc now
      const { updateDoc, doc } = await import("firebase/firestore");
      await updateDoc(doc(db, "products", productRef.id), { qrCodeUrl });

      onClose();
      setFormData({ name: "", price: "", description: "" });
      setFiles({ model: null, image: null });
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <h2 className="text-xl font-bold">Add New Product</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Product Name</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm focus:border-white focus:outline-none"
                  placeholder="e.g. Wagyu Burger"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm focus:border-white focus:outline-none"
                  placeholder="24.99"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm focus:border-white focus:outline-none min-h-[100px]"
                placeholder="Describe the dish..."
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">3D Model (GLB)</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-600">
                <Box className="mb-2 h-8 w-8 text-zinc-500" />
                <span className="text-xs text-zinc-400">
                  {files.model ? files.model.name : "Click to upload GLB"}
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={(e) => setFiles({ ...files, model: e.target.files?.[0] || null })}
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Thumbnail Image</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-600">
                <ImageIcon className="mb-2 h-8 w-8 text-zinc-500" />
                <span className="text-xs text-zinc-400">
                  {files.image ? files.image.name : "Click to upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFiles({ ...files, image: e.target.files?.[0] || null })}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Product...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
