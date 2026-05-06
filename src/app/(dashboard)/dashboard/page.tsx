export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Companies", value: "124", change: "+12%", trend: "up" },
          { label: "Active Products", value: "3,542", change: "+5%", trend: "up" },
          { label: "Forum Posts", value: "1,205", change: "-2%", trend: "down" },
          { label: "Subscriptions", value: "$12,450", change: "+18%", trend: "up" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={stat.trend === "up" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col justify-center items-center text-gray-400">
          <p>Recent Activity Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col justify-center items-center text-gray-400">
          <p>Top Content Placeholder</p>
        </div>
      </div>
    </div>
  );
}
