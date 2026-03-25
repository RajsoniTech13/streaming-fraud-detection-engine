import { Database, Server, Cpu, Layers } from 'lucide-react';

export default function SystemParameters() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">System Parameters & Architecture</h1>
        <p className="text-slate-400 text-sm">Detailed overview of the data engineering pipeline and schema definitions used in the Sentinel engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture Flow */}
        <div className="pro-card p-6">
          <div className="flex items-center mb-6">
            <Layers className="w-5 h-5 text-primary-400 mr-3" />
            <h2 className="text-lg font-medium text-white">Pipeline Architecture</h2>
          </div>
          
          <div className="space-y-6 mt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700 relative z-10">
                <Database className="w-5 h-5 text-slate-300" />
              </div>
              <div className="ml-4 pt-1">
                <h3 className="text-sm font-medium text-white">1. Data Ingestion (Kafka)</h3>
                <p className="text-slate-400 mt-1 text-xs leading-relaxed">Live generator produces transactions published sequentially to Confluent Kafka topic <span className="text-primary-400 font-mono">transactions</span>.</p>
              </div>
            </div>

            <div className="ml-5 border-l border-dark-700 h-8 -mt-6 mb-2"></div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center border border-primary-500/20 relative z-10">
                <Cpu className="w-5 h-5 text-primary-400" />
              </div>
              <div className="ml-4 pt-1">
                <h3 className="text-sm font-medium text-primary-200">2. Real-time Inference (PySpark)</h3>
                <p className="text-slate-400 mt-1 text-xs leading-relaxed">Structured Streaming consumes Kafka, computes complex risk scores based on heuristics.</p>
              </div>
            </div>

            <div className="ml-5 border-l border-primary-500/20 h-8 -mt-6 mb-2"></div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700 relative z-10">
                <Database className="w-5 h-5 text-slate-300" />
              </div>
              <div className="ml-4 pt-1">
                <h3 className="text-sm font-medium text-white">3. Distributed Storage (HDFS Parquet)</h3>
                <p className="text-slate-400 mt-1 text-xs leading-relaxed">Analyzed batches sink to Hadoop as `.snappy.parquet` logs at <span className="text-primary-400 font-mono">hdfs://namenode:8020/fraud_data</span>.</p>
              </div>
            </div>

            <div className="ml-5 border-l border-dark-700 h-8 -mt-6 mb-2"></div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700 relative z-10">
                <Server className="w-5 h-5 text-slate-300" />
              </div>
              <div className="ml-4 pt-1">
                <h3 className="text-sm font-medium text-white">4. API Serving (FastAPI)</h3>
                <p className="text-slate-400 mt-1 text-xs leading-relaxed">ASGI server mapped to Port 8501 queries Parquet files on demand, aggregating JSON.</p>
              </div>
            </div>
            
            <div className="ml-5 border-l border-dark-700 h-8 -mt-6 mb-2"></div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700 relative z-10">
                <Cpu className="w-5 h-5 text-slate-300" />
              </div>
              <div className="ml-4 pt-1">
                <h3 className="text-sm font-medium text-white">5. Client Visualization (Vite React)</h3>
                <p className="text-slate-400 mt-1 text-xs leading-relaxed">SPA polling FastAPI every 5 seconds to render dynamic Recharts arrays.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Schema */}
        <div className="pro-card p-6 flex flex-col h-full">
          <div className="flex items-center mb-6">
            <Database className="w-5 h-5 text-primary-400 mr-3" />
            <h2 className="text-lg font-medium text-white">Transaction Schema</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-dark-800 text-slate-300">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md font-medium">Field Name</th>
                  <th className="px-4 py-3 font-medium">Data Type</th>
                  <th className="px-4 py-3 rounded-tr-md font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">transaction_id</td>
                  <td className="px-4 py-3 text-slate-400">UUID String</td>
                  <td className="px-4 py-3 text-slate-400">Unique identifier for the tx</td>
                </tr>
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">user_id</td>
                  <td className="px-4 py-3 text-slate-400">Integer</td>
                  <td className="px-4 py-3 text-slate-400">Originating account ID</td>
                </tr>
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">amount</td>
                  <td className="px-4 py-3 text-slate-400">Float</td>
                  <td className="px-4 py-3 text-slate-400">Transaction value (USD)</td>
                </tr>
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">timestamp</td>
                  <td className="px-4 py-3 text-slate-400">ISO 8601 String</td>
                  <td className="px-4 py-3 text-slate-400">Time of execution</td>
                </tr>
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">country</td>
                  <td className="px-4 py-3 text-slate-400">String</td>
                  <td className="px-4 py-3 text-slate-400">Geo-located country</td>
                </tr>
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">payment_method</td>
                  <td className="px-4 py-3 text-slate-400">Enum String</td>
                  <td className="px-4 py-3 text-slate-400">crypto, credit_card, etc.</td>
                </tr>
                <tr className="pro-table-row">
                  <td className="px-4 py-3 font-mono text-primary-400">device_type</td>
                  <td className="px-4 py-3 text-slate-400">Enum String</td>
                  <td className="px-4 py-3 text-slate-400">mobile, desktop, tablet</td>
                </tr>
                <tr className="pro-table-row bg-safe-500/5 border-l-2 border-safe-500">
                  <td className="px-4 py-3 font-mono text-safe-400">risk_score</td>
                  <td className="px-4 py-3 text-slate-400">Integer</td>
                  <td className="px-4 py-3 text-slate-400">Computed Spark heuristic metric (0-100+)</td>
                </tr>
                <tr className="pro-table-row bg-danger-500/5 border-l-2 border-danger-500 border-b-0">
                  <td className="px-4 py-3 font-mono text-danger-400">risk_level</td>
                  <td className="px-4 py-3 text-slate-400">Enum String</td>
                  <td className="px-4 py-3 text-slate-400">SAFE, MEDIUM, HIGH</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
