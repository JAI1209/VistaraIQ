const stats = [
  { title: "Total Blueprints", value: "124", delta: "+18% this month" },
  { title: "Active Users", value: "2,930", delta: "+6.2% this week" },
  { title: "Growth %", value: "34.8%", delta: "+4.4% since last cycle" },
];

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back to VistaraIQ</h1>
      <p className="mt-2 text-sm text-slate-300">Your intelligence and growth metrics at a glance.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-[#11182B] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
          >
            <p className="text-sm text-slate-300">{card.title}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-3 text-xs font-medium text-blue-300">{card.delta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
