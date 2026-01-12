
import React, { useState } from 'react';
import { History, ArrowUpRight, ArrowDownRight, AlertTriangle, Calendar } from 'lucide-react';
import { db } from '../db';
import { TransactionType } from '../types';

const Transactions: React.FC = () => {
  const transactions = db.getTransactions();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-slate-500">Full audit log of equipment movements and status changes</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-sm font-medium">All Time</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {transactions.map((trx) => (
            <div key={trx.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-6">
              <div className={`p-3 rounded-2xl ${
                trx.type === TransactionType.IN ? 'bg-green-50 text-green-600' :
                trx.type === TransactionType.REPAIR ? 'bg-red-50 text-red-600' :
                'bg-slate-50 text-slate-600'
              }`}>
                {trx.type === TransactionType.IN ? <ArrowUpRight size={24} /> : 
                 trx.type === TransactionType.REPAIR ? <AlertTriangle size={24} /> : 
                 <ArrowDownRight size={24} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 truncate">{trx.equipmentName}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    trx.type === TransactionType.IN ? 'bg-green-100 text-green-700' :
                    trx.type === TransactionType.REPAIR ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {trx.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{trx.note}</p>
                <p className="text-xs text-slate-400 mt-2 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {trx.date}
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <div className="text-xs font-mono text-slate-400 tracking-tight">
                  REF: {trx.id}
                </div>
                <div className="text-[10px] text-slate-300 font-bold uppercase mt-1">
                  SECURE LOG
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No transactions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
