import { useState } from "react";

import EditButton from "../common/EditButton";

export default function Subscription() {
  const [plans] = useState([
    {
      name: "Individual & Academic Institution",
      type: "Print",
      inr: "2000.00",
      usd: "250.00"
    },
    {
      name: "For Scholars & Authors",
      type: "Print",
      inr: "1500.00",
      usd: "150.00"
    },
    {
      name: "Annual Member",
      type: "Print & Online",
      inr: "1700.00",
      usd: "200.00"
    },
    {
      name: "Life Member",
      type: "Print & Online",
      inr: "8000.00",
      usd: "800.00"
    },
    {
      name: "Life Member For Institutions",
      type: "Print & Online",
      inr: "10000.00",
      usd: "1000.00"
    }
  ]);

  const handleEdit = () => alert("Open Admin Modal: Edit Subscriptions");

  return (
    <section className="relative bg-stone-900 py-24 text-stone-200">
      <EditButton onClick={handleEdit} label="Edit Fees" />
      
      <div className="mx-auto max-w-5xl px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
            Subscription Fees
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-500" />
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-800/50 shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-800 text-xs uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Subscription Type</th>
                  <th className="px-6 py-4 font-semibold">Format</th>
                  <th className="px-6 py-4 font-semibold text-right">INR (Rs)</th>
                  <th className="px-6 py-4 font-semibold text-right">USD ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700/50">
                {plans.map((plan, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-stone-700/30">
                    <td className="px-6 py-4 font-medium text-white">{plan.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-700 px-2.5 py-1 text-[10px] uppercase tracking-wider text-stone-300">
                        {plan.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-amber-400">{plan.inr}</td>
                    <td className="px-6 py-4 text-right font-mono text-amber-400">{plan.usd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-stone-800/80 px-6 py-4 text-xs text-stone-400 border-t border-stone-700 flex justify-between items-center">
            <p>Payments are payable in favor of <strong>"ARYAN RESEARCH & EDUCATIONAL TRUST"</strong>.</p>
          </div>
        </div>

      </div>
    </section>
  );
}