import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  Package, 
  BarChart3, 
  Menu as MenuIcon,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import ProductList from "../components/ProductList";
import AnalyticsView from "../components/AnalyticsView";
import ProductModal from "../components/ProductModal";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-800 bg-zinc-900 transition-transform duration-300 lg:static lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AR Menu Pro</span>
          </div>

          <nav className="mt-10 flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-white text-black" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-md">
          <button 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                const { collection, addDoc, serverTimestamp, updateDoc, doc } = await import("firebase/firestore");
                const { db } = await import("../firebase");
                const QRCode = (await import("qrcode")).default;
                
                const productRef = await addDoc(collection(db, "products"), {
                  name: "Test Wagyu Burger",
                  price: 25.99,
                  description: "A premium test burger to verify your AR experience works perfectly.",
                  modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
                  imageUrl: "https://picsum.photos/seed/burger/800/600",
                  scanCount: 0,
                  createdAt: serverTimestamp(),
                });

                const productUrl = `${window.location.origin}/product/${productRef.id}`;
                const qrDataUrl = await QRCode.toDataURL(productUrl, { width: 512 });
                await updateDoc(doc(db, "products", productRef.id), { qrCodeUrl: qrDataUrl });
                alert("Test product added successfully!");
              }}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Seed Test Product
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </header>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview products={products} />} />
            <Route path="/products" element={<ProductList products={products} loading={loading} />} />
            <Route path="/analytics" element={<AnalyticsView products={products} />} />
          </Routes>
        </div>
      </main>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function DashboardOverview({ products }: { products: any[] }) {
  const totalScans = products.reduce((acc, p) => acc + (p.scanCount || 0), 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-zinc-400 text-lg">Here's what's happening with your menu today.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          label="Total Products" 
          value={products.length} 
          icon={Package} 
          color="blue"
        />
        <StatCard 
          label="Total Scans" 
          value={totalScans} 
          icon={BarChart3} 
          color="green"
        />
        <StatCard 
          label="Active AR Models" 
          value={products.filter(p => p.modelUrl).length} 
          icon={LayoutDashboard} 
          color="purple"
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
        <ProductList products={products.slice(0, 5)} loading={false} compact />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <div className={cn("rounded-2xl border p-6", colors[color])}>
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-4 font-medium opacity-80">{label}</p>
    </div>
  );
}
