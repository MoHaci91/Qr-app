import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function AnalyticsView({ products }: { products: any[] }) {
  // Mock data for visualization - in a real app we'd fetch from a 'scans' collection
  const chartData = products.map(p => ({
    name: p.name,
    scans: p.scanCount || 0
  })).sort((a, b) => b.scans - a.scans).slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-zinc-400">Track how your customers are interacting with the menu.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-6 text-lg font-semibold">Top Scanned Products</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="scans" fill="#fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-6 text-lg font-semibold">Scan Trends (Mock)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { date: "Mon", scans: 45 },
                { date: "Tue", scans: 52 },
                { date: "Wed", scans: 38 },
                { date: "Thu", scans: 65 },
                { date: "Fri", scans: 89 },
                { date: "Sat", scans: 120 },
                { date: "Sun", scans: 95 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="scans" stroke="#fff" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
