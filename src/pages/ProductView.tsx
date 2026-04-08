import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Box, 
  Info, 
  ChevronUp, 
  Maximize2, 
  Share2,
  AlertCircle
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";

export default function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          
          // Track scan
          await updateDoc(docRef, { scanCount: increment(1) });
          await addDoc(collection(db, "products", id, "scans"), {
            productId: id,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
          });
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
          <p className="mt-4 text-zinc-400 font-medium">Preparing your 3D experience...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-screen items-center justify-center bg-black p-6 text-center text-white">
        <div className="max-w-xs">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-xl font-bold">{error}</h1>
          <p className="mt-2 text-zinc-400">Please try scanning the QR code again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      {/* AR Viewer using model-viewer */}
      {/* @ts-ignore */}
      <model-viewer
        src={product.modelUrl}
        ios-src={product.iosModelUrl || ""} // Fallback to GLB if USDZ not provided
        alt={product.name}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
      >
        <button 
          slot="ar-button" 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black shadow-xl transition-transform active:scale-95"
        >
          <Maximize2 className="h-5 w-5" />
          View in AR
        </button>
      {/* @ts-ignore */}
      </model-viewer>

      {/* UI Overlay */}
      <div className="absolute inset-x-0 top-0 p-6 pointer-events-none">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <Box className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">{product.name}</h1>
              <p className="text-sm text-zinc-400 mt-1">{formatCurrency(product.price)}</p>
            </div>
          </motion.div>

          <button className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900/50 text-white backdrop-blur-md border border-white/10">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{product.name}</h2>
              <p className="text-zinc-400">{formatCurrency(product.price)}</p>
            </div>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="rounded-full bg-zinc-800 p-2 text-zinc-400"
            >
              <ChevronUp className={cn("h-6 w-6 transition-transform", showInfo && "rotate-180")} />
            </button>
          </div>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 text-zinc-300 text-sm leading-relaxed">
                  {product.description || "No description available for this item."}
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="flex-1 rounded-xl bg-zinc-800 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Category</p>
                    <p className="text-sm font-semibold">Main Course</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-zinc-800 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Calories</p>
                    <p className="text-sm font-semibold">450 kcal</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

