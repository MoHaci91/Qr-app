import { 
  QrCode, 
  Trash2, 
  ExternalLink, 
  Download,
  Eye
} from "lucide-react";
import { db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { formatCurrency } from "../lib/utils";

interface ProductListProps {
  products: any[];
  loading: boolean;
  compact?: boolean;
}

export default function ProductList({ products, loading, compact }: ProductListProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50">
        <Package className="mb-4 h-12 w-12 text-zinc-600" />
        <p className="text-zinc-400">No products found. Add your first dish!</p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  );
}

function ProductCard({ product, compact }: { product: any; compact?: boolean }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      // In a real app, we'd also delete files from storage
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const downloadQR = async () => {
    if (!product.qrCodeUrl) return;
    const response = await fetch(product.qrCodeUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product.name}-QR.png`;
    a.click();
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-900">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-700">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-zinc-500">{formatCurrency(product.price)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadQR} className="rounded-lg p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <Download className="h-4 w-4" />
          </button>
          <Link to={`/product/${product.id}`} target="_blank" className="rounded-lg p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700">
      <div className="relative aspect-video overflow-hidden bg-zinc-950">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-800">
            <Package className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={downloadQR} className="rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="rounded-full bg-red-500/20 p-2 text-red-500 backdrop-blur-md hover:bg-red-500 hover:text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{product.description}</p>
          </div>
          <span className="text-lg font-bold text-white">{formatCurrency(product.price)}</span>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Eye className="h-4 w-4" />
            {product.scanCount || 0} scans
          </div>
          <Link 
            to={`/product/${product.id}`} 
            target="_blank"
            className="flex items-center gap-2 text-sm font-semibold text-white hover:underline"
          >
            View AR
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Package } from "lucide-react";
import { Link } from "react-router-dom";
