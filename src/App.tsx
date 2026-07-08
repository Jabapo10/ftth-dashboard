import { useState, useMemo } from "react";
import { Wifi, WifiOff, AlertTriangle, Radio, Activity, Search } from "lucide-react";

// ---------- Datos de ejemplo (simulan lo que vendría de una plataforma Huawei FTTH) ----------
const OLT_INFO = {
  name: "OLT-CENTRAL-01",
  model: "Huawei MA5800-X17",
  uptime: "142 días, 6 h",
  totalPorts: 16,
  activePorts: 14,
};

const PON_PORTS = [
  { id: "0/1/0", onts: 32, active: 30, alarms: 1 },
  { id: "0/1/1", onts: 28, active: 28, alarms: 0 },
  { id: "0/2/0", onts: 30, active: 27, alarms: 2 },
  { id: "0/2/1", onts: 24, active: 24, alarms: 0 },
];

const ONTS = [
  { id: "ONT-0142", port: "0/1/0", sn: "HWTC8A2F1C90", cliente: "Av. Libertad 245", rx: -18.4, tx: 2.1, distancia: 3.2, estado: "online" },
  { id: "ONT-0143", port: "0/1/0", sn: "HWTC8A2F1C91", cliente: "Calle Rivadavia 88", rx: -22.7, tx: 2.0, distancia: 4.8, estado: "online" },
  { id: "ONT-0144", port: "0/1/0", sn: "HWTC8A2F1C92", cliente: "Belgrano 1120", rx: -27.9, tx: 2.2, distancia: 6.1, estado: "alarma" },
  { id: "ONT-0201", port: "0/1/1", sn: "HWTC8A2F1D10", cliente: "San Martín 340", rx: -19.1, tx: 2.1, distancia: 2.9, estado: "online" },
  { id: "ONT-0202", port: "0/1/1", sn: "HWTC8A2F1D11", cliente: "Mitre 705", rx: -20.5, tx: 1.9, distancia: 3.5, estado: "online" },
  { id: "ONT-0305", port: "0/2/0", sn: "HWTC8A2F1E44", cliente: "9 de Julio 210", rx: 0, tx: 0, distancia: 5.4, estado: "offline" },
  { id: "ONT-0306", port: "0/2/0", sn: "HWTC8A2F1E45", cliente: "Sarmiento 88", rx: -21.3, tx: 2.0, distancia: 4.1, estado: "online" },
  { id: "ONT-0307", port: "0/2/0", sn: "HWTC8A2F1E46", cliente: "Alem 560", rx: -29.8, tx: 2.3, distancia: 7.2, estado: "alarma" },
  { id: "ONT-0410", port: "0/2/1", sn: "HWTC8A2F1F02", cliente: "Moreno 130", rx: -17.6, tx: 2.1, distancia: 2.4, estado: "online" },
];

// Rangos típicos de potencia óptica recibida (dBm) para PON en Huawei
function signalQuality(rx: number, estado: string) {
  if (estado === "offline") return { label: "Sin señal", color: "text-slate-500", bar: 0 };
  if (rx >= -24) return { label: "Excelente", color: "text-cyan-400", bar: 100 };
  if (rx >= -27) return { label: "Aceptable", color: "text-amber-400", bar: 60 };
  return { label: "Crítica", color: "text-rose-500", bar: 25 };
}

// Color de fondo de la fila completa según el estado de la ONT
function rowBackground(estado: string) {
  if (estado === "online") return "bg-cyan-500/10 hover:bg-cyan-500/20";
  if (estado === "alarma") return "bg-amber-500/10 hover:bg-amber-500/20";
  return "bg-slate-700/30 hover:bg-slate-700/40";
}

function StatusIcon({ estado }: { estado: string }) {
  if (estado === "online") return <Wifi className="w-4 h-4 text-cyan-400" />;
  if (estado === "offline") return <WifiOff className="w-4 h-4 text-slate-500" />;
  return <AlertTriangle className="w-4 h-4 text-amber-400" />;
}

export default function FTTHDashboard() {
  const [filtro, setFiltro] = useState("");
  const [portFilter, setPortFilter] = useState("todos");

  const filtered = useMemo(() => {
    return ONTS.filter((o) => {
      const matchesText =
        o.id.toLowerCase().includes(filtro.toLowerCase()) ||
        o.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
        o.sn.toLowerCase().includes(filtro.toLowerCase());
      const matchesPort = portFilter === "todos" || o.port === portFilter;
      return matchesText && matchesPort;
    });
  }, [filtro, portFilter]);

  const counts = {
    online: ONTS.filter((o) => o.estado === "online").length,
    alarma: ONTS.filter((o) => o.estado === "alarma").length,
    offline: ONTS.filter((o) => o.estado === "offline").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono">
      <header className="border-b border-slate-500 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-slate-100 font-semibold tracking-tight">{OLT_INFO.name}</h1>
            <p className="text-xs text-slate-500">{OLT_INFO.model} · uptime {OLT_INFO.uptime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          datos de ejemplo — no conectado a equipo real
        </div>
      </header>

      <main className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Puertos PON activos" value={`${OLT_INFO.activePorts}/${OLT_INFO.totalPorts}`} icon={<Activity className="w-4 h-4" />} accent="text-slate-100" />
          <SummaryCard label="ONTs en línea" value={counts.online} icon={<Wifi className="w-4 h-4" />} accent="text-cyan-400" />
          <SummaryCard label="Con alarma" value={counts.alarma} icon={<AlertTriangle className="w-4 h-4" />} accent="text-amber-400" />
          <SummaryCard label="Fuera de línea" value={counts.offline} icon={<WifiOff className="w-4 h-4" />} accent="text-rose-500" />
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-2">Puertos PON</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PON_PORTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPortFilter(portFilter === p.id ? "todos" : p.id)}
                className={`text-left rounded-lg border px-4 py-3 transition ${
                  portFilter === p.id
                    ? "border-cyan-500/60 bg-cyan-500/5"
                    : "border-slate-500 bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium">{p.id}</span>
                  {p.alarms > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {p.alarms} alarma{p.alarms > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{p.active}/{p.onts} ONTs activas</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2 gap-3">
            <h2 className="text-xs uppercase tracking-widest text-slate-500">ONTs</h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
              <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por ID, cliente o serie..."
                className="bg-slate-900 border border-slate-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 w-64"
              />
            </div>
          </div>

          <div className="border border-slate-500 rounded-lg overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-500 text-left">
                  <th className="px-3 py-2 font-normal border-r border-slate-500">Estado</th>
                  <th className="px-3 py-2 font-normal border-r border-slate-500">ONT</th>
                  <th className="px-3 py-2 font-normal border-r border-slate-500">Puerto</th>
                  <th className="px-3 py-2 font-normal border-r border-slate-500">Cliente</th>
                  <th className="px-3 py-2 font-normal border-r border-slate-500">N/S</th>
                  <th className="px-3 py-2 font-normal border-r border-slate-500">Rx (dBm)</th>
                  <th className="px-3 py-2 font-normal border-r border-slate-500">Señal</th>
                  <th className="px-3 py-2 font-normal">Distancia</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const q = signalQuality(o.rx, o.estado);
                  return (
                    <tr key={o.id} className={`border-t border-slate-500/60 transition-colors ${rowBackground(o.estado)}`}>
                      <td className="px-3 py-2 border-r border-slate-500/60"><StatusIcon estado={o.estado} /></td>
                      <td className="px-3 py-2 border-r border-slate-500/60 text-slate-200 font-medium">{o.id}</td>
                      <td className="px-3 py-2 border-r border-slate-500/60 text-slate-500">{o.port}</td>
                      <td className="px-3 py-2 border-r border-slate-500/60 text-slate-300">{o.cliente}</td>
                      <td className="px-3 py-2 border-r border-slate-500/60 text-slate-600">{o.sn}</td>
                      <td className={`px-3 py-2 border-r border-slate-500/60 font-semibold ${q.color}`}>{o.estado === "offline" ? "—" : o.rx.toFixed(1)}</td>
                      <td className="px-3 py-2 border-r border-slate-500/60">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${q.bar > 70 ? "bg-cyan-400" : q.bar > 40 ? "bg-amber-400" : q.bar > 0 ? "bg-rose-500" : "bg-slate-700"}`}
                              style={{ width: `${q.bar}%` }}
                            />
                          </div>
                          <span className={`text-[10px] ${q.color}`}>{q.label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{o.distancia} km</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-600">
                      Sin resultados para esta búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="border border-slate-500 rounded-lg bg-slate-900/40 px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={accent}>{icon}</span>
      </div>
      <p className={`text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
