import { Database, Server, Cpu, Layers, ArrowDown, CheckCircle2, Radio, Box, Globe, Code2, Gauge, Wifi } from 'lucide-react';

const techStack = [
  { name: 'Apache Kafka', role: 'Stream Ingestion', color: 'from-orange-500 to-amber-500', icon: Radio },
  { name: 'Apache Spark', role: 'Real-time Inference', color: 'from-primary-500 to-cyan-500', icon: Cpu },
  { name: 'Hadoop HDFS', role: 'Distributed Storage', color: 'from-cyan-500 to-blue-500', icon: Database },
  { name: 'FastAPI', role: 'API Serving', color: 'from-safe-500 to-emerald-400', icon: Server },
  { name: 'React + Vite', role: 'Client Rendering', color: 'from-cyan-400 to-primary-400', icon: Globe },
];

const pipelineSteps = [
  {
    icon: Radio,
    title: 'Data Ingestion (Kafka)',
    description: 'Live generator produces transactions published sequentially to Confluent Kafka topic',
    detail: 'transactions',
    color: 'from-orange-500 to-amber-500',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    iconColor: 'text-orange-400',
    metrics: { label: 'Throughput', value: '~1K msg/s' },
  },
  {
    icon: Cpu,
    title: 'Real-time Inference (PySpark)',
    description: 'Structured Streaming consumes Kafka, computes complex risk scores based on heuristics',
    detail: 'spark-submit --master local[*]',
    color: 'from-primary-500 to-cyan-500',
    iconBg: 'bg-primary-500/10 border-primary-500/20',
    iconColor: 'text-primary-400',
    metrics: { label: 'Latency', value: '<200ms' },
  },
  {
    icon: Database,
    title: 'Distributed Storage (HDFS Parquet)',
    description: 'Analyzed batches sink to Hadoop as .snappy.parquet logs',
    detail: 'hdfs://namenode:8020/fraud_data',
    color: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconColor: 'text-cyan-400',
    metrics: { label: 'Format', value: 'Parquet' },
  },
  {
    icon: Server,
    title: 'API Serving (FastAPI)',
    description: 'ASGI server mapped to Port 8501 queries Parquet files on demand, aggregating JSON',
    detail: 'uvicorn main:app --port 8501',
    color: 'from-safe-500 to-emerald-400',
    iconBg: 'bg-safe-500/10 border-safe-500/20',
    iconColor: 'text-safe-400',
    metrics: { label: 'Port', value: '8501' },
  },
  {
    icon: Globe,
    title: 'Client Visualization (Vite React)',
    description: 'SPA polling FastAPI every 5 seconds to render dynamic Recharts arrays',
    detail: 'npm run dev -- --port 5173',
    color: 'from-cyan-400 to-primary-400',
    iconBg: 'bg-primary-500/10 border-primary-500/20',
    iconColor: 'text-primary-300',
    metrics: { label: 'Polling', value: '5s' },
  }
];

const schemaFields = [
  { field: 'transaction_id', type: 'UUID String', desc: 'Unique identifier for the tx', category: 'identity' },
  { field: 'user_id', type: 'Integer', desc: 'Originating account ID', category: 'identity' },
  { field: 'amount', type: 'Float', desc: 'Transaction value (USD)', category: 'financial' },
  { field: 'timestamp', type: 'ISO 8601 String', desc: 'Time of execution', category: 'temporal' },
  { field: 'country', type: 'String', desc: 'Geo-located country', category: 'geo' },
  { field: 'payment_method', type: 'Enum String', desc: 'crypto, credit_card, etc.', category: 'financial' },
  { field: 'device_type', type: 'Enum String', desc: 'mobile, desktop, tablet', category: 'device' },
  { field: 'risk_score', type: 'Integer', desc: 'Computed Spark heuristic metric (0-100+)', category: 'risk' },
  { field: 'risk_level', type: 'Enum String', desc: 'SAFE, MEDIUM, HIGH', category: 'risk' },
];

const categoryColors = {
  identity: 'text-primary-400',
  financial: 'text-cyan-400',
  temporal: 'text-slate-400',
  geo: 'text-warning-400',
  device: 'text-slate-300',
  risk: 'text-danger-400',
};

const systemHealth = [
  { label: 'Kafka Broker', status: 'active', latency: '12ms' },
  { label: 'Spark Engine', status: 'active', latency: '45ms' },
  { label: 'HDFS NameNode', status: 'active', latency: '8ms' },
  { label: 'FastAPI Server', status: 'active', latency: '3ms' },
];

export default function SystemParameters() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Engine <span className="gradient-text">Parameters</span>
        </h1>
        <p className="text-slate-500 text-sm">Detailed overview of the data engineering pipeline and schema definitions used in the Sentinel engine.</p>
      </div>

      {/* Tech Stack Badges */}
      <div className="flex flex-wrap gap-3 animate-fade-in fill-both stagger-1">
        {techStack.map((tech, idx) => (
          <div key={idx} className="pro-card px-4 py-3 flex items-center gap-3 group cursor-default">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <tech.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{tech.name}</p>
              <p className="text-[10px] text-slate-500">{tech.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Bar */}
      <div className="pro-card p-5 animate-fade-in fill-both stagger-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-safe-400" />
            System Health Monitor
          </h3>
          <span className="badge-safe">
            <span className="w-1.5 h-1.5 rounded-full bg-safe-500 mr-1.5 animate-pulse" />
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {systemHealth.map((sys, idx) => (
            <div key={idx} className="bg-dark-850 rounded-xl p-3 border border-dark-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-safe-500 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">{sys.label}</span>
              </div>
              <span className="text-[10px] font-mono text-safe-400">{sys.latency}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Architecture */}
        <div className="pro-card p-6 animate-fade-in fill-both stagger-3">
          <div className="flex items-center mb-6 gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Pipeline Architecture</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">End-to-end data flow</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {pipelineSteps.map((step, idx) => (
              <div key={idx}>
                <div className="flex items-start group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${step.iconBg} border flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                  <div className="ml-4 flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">{step.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Gauge className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-400">{step.metrics.label}:</span>
                        <span className="text-cyan-400 font-mono font-medium">{step.metrics.value}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 mt-1 text-xs leading-relaxed">{step.description}</p>
                    <code className="text-[10px] text-primary-400 font-mono bg-primary-500/5 px-2 py-0.5 rounded-md mt-1.5 inline-block border border-primary-500/10">
                      {step.detail}
                    </code>
                  </div>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="ml-5 flex items-center h-8 -mt-1 mb-0">
                    <div className={`w-px h-full bg-gradient-to-b ${step.color} opacity-30`} />
                    <ArrowDown className="w-3 h-3 text-slate-600 ml-1 animate-bounce" style={{ animationDelay: `${idx * 200}ms`, animationDuration: '2s' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Schema */}
        <div className="pro-card p-6 flex flex-col animate-fade-in fill-both stagger-4">
          <div className="flex items-center mb-6 gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-primary-500 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Transaction Schema</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{schemaFields.length} fields defined</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-dark-700/30">
                  <th className="px-4 py-3 font-medium text-slate-500 text-[10px] uppercase tracking-wider">Field</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-[10px] uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-[10px] uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/20">
                {schemaFields.map((f, idx) => (
                  <tr
                    key={idx}
                    className={`pro-table-row group ${
                      f.category === 'risk'
                        ? 'border-l-2 border-l-danger-500/40 bg-danger-500/[0.02]'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs ${categoryColors[f.category]}`}>{f.field}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-400 bg-dark-800/60 px-2 py-0.5 rounded-md text-[10px]">{f.type}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* API Endpoints Reference */}
      <div className="pro-card p-6 animate-fade-in fill-both stagger-5">
        <div className="flex items-center mb-5 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-safe-500 to-cyan-500 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">API Endpoints</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">FastAPI routes on Port 8501</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            { method: 'GET', path: '/api/risk-distribution', desc: 'Risk level counts', color: 'text-safe-400' },
            { method: 'GET', path: '/api/country-fraud', desc: 'High-risk by country', color: 'text-safe-400' },
            { method: 'GET', path: '/api/payment-fraud', desc: 'High-risk by payment method', color: 'text-safe-400' },
            { method: 'GET', path: '/api/device-fraud', desc: 'High-risk by device type', color: 'text-safe-400' },
            { method: 'GET', path: '/api/recent-high-risk', desc: 'Latest 10 critical txns', color: 'text-safe-400' },
          ].map((api, idx) => (
            <div key={idx} className="bg-dark-850 rounded-xl p-3.5 border border-dark-700/30 group hover:border-dark-600/50 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-safe-400 bg-safe-500/10 px-2 py-0.5 rounded-md border border-safe-500/10">{api.method}</span>
                <code className="text-xs font-mono text-primary-400 truncate">{api.path}</code>
              </div>
              <p className="text-[10px] text-slate-500">{api.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
