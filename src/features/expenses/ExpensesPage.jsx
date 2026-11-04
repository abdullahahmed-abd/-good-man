import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import AddTransactionModal from './AddTransactionModal';
import SetBudgetModal from './SetBudgetModal';
import AddSavingsGoalModal from './AddSavingsGoalModal';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Sliders, 
  Target, 
  Download, 
  Upload, 
  Search, 
  Trash2,
  AlertTriangle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import db from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import sounds from '../../utils/soundEffects';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export default function ExpensesPage() {
  const { user } = useAppStore();
  const currency = user.currency === 'USD' ? '$' : '₹';

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTx, setShowAddTx] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const loadData = async () => {
    try {
      let storedTx = await db.transactions.toArray();
      if (storedTx.length === 0) {
        // Preload sample transactions
        const sampleTx = [
          {
            id: 'tx-1',
            type: 'income',
            amount: 65000,
            category: 'Work & Deep Work',
            paymentMethod: 'Bank Transfer',
            note: 'Monthly Consulting / Salary',
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now() - 86400000 * 2
          },
          {
            id: 'tx-2',
            type: 'expense',
            amount: 750,
            category: 'Philosophy & Books',
            paymentMethod: 'UPI / Digital',
            note: 'Seneca and Marcus Aurelius Translations',
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now() - 86400000
          },
          {
            id: 'tx-3',
            type: 'expense',
            amount: 3200,
            category: 'Health & Fitness',
            paymentMethod: 'Card',
            note: 'Running Shoes & Electrolytes',
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now()
          },
          {
            id: 'tx-4',
            type: 'expense',
            amount: 1500,
            category: 'Charity & Generosity',
            paymentMethod: 'UPI / Digital',
            note: 'Meals for street children',
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now()
          }
        ];
        for (const t of sampleTx) {
          await db.transactions.add(t);
        }
        storedTx = sampleTx;
      }
      storedTx.sort((a, b) => b.createdAt - a.createdAt);
      setTransactions(storedTx);

      // Budgets
      const storedBudgets = await db.budgets.toArray();
      setBudgets(storedBudgets);

      // Savings Goals
      let storedGoals = await db.savingsGoals.toArray();
      if (storedGoals.length === 0) {
        const sampleGoal = {
          id: 'goal-peace-fund',
          title: 'Emergency Peace of Mind Fund (6 Months)',
          targetAmount: 180000,
          currentAmount: 75000,
          targetDate: '2026-12-31',
          color: '#10b981',
          createdAt: Date.now()
        };
        await db.savingsGoals.add(sampleGoal);
        storedGoals = [sampleGoal];
      }
      setSavingsGoals(storedGoals);
    } catch (e) {
      console.warn('Error loading financial data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Category Breakdown for Pie Chart
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expenseByCategory).map(cat => ({
    name: cat,
    value: expenseByCategory[cat]
  }));

  const handleDeleteTx = async (id, e) => {
    e.stopPropagation();
    sounds.playTap();
    await db.transactions.delete(id);
    loadData();
  };

  // CSV Export
  const handleExportCSV = () => {
    sounds.playTap();
    const headers = 'ID,Type,Category,Amount,PaymentMethod,Date,Note\n';
    const rows = transactions.map(t => 
      `"${t.id}","${t.type}","${t.category}",${t.amount},"${t.paymentMethod}","${t.date}","${t.note}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insaan-finances-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered transactions
  const filteredTx = transactions.filter(t => 
    t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <Wallet className="w-4 h-4" />
            <span>Financial Serenity & Conscious Stewardship</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Wealth & Mindful Budgeting
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            "It is not the man who has too little, but the man who craves more, that is poor." — Seneca
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              sounds.playTap();
              setShowSetBudget(true);
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Set Category Budgets"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Budgets</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setShowAddGoal(true);
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Create Savings Goal"
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Savings Goal</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setShowAddTx(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SpatialCard className="p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Net Sanctuary Balance</span>
          <p className="text-2xl font-black text-white">
            {currency}{netBalance.toLocaleString()}
          </p>
        </SpatialCard>

        <SpatialCard className="p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Total Inflow
          </span>
          <p className="text-2xl font-black text-emerald-400">
            {currency}{totalIncome.toLocaleString()}
          </p>
        </SpatialCard>

        <SpatialCard className="p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" /> Total Outflow
          </span>
          <p className="text-2xl font-black text-rose-400">
            {currency}{totalExpense.toLocaleString()}
          </p>
        </SpatialCard>

        <SpatialCard className="p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Savings Rate</span>
          <p className="text-2xl font-black text-amber-300">
            {savingsRate}%
          </p>
        </SpatialCard>
      </div>

      {/* Middle Row: Category Pie Chart + Monthly Budgets Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Pie Chart */}
        <SpatialCard className="lg:col-span-5 flex flex-col justify-between" glassStyle="subtle">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Expense Allocation</span>
            </h3>
            <span className="text-xs text-slate-400">{currency}{totalExpense.toLocaleString()}</span>
          </div>

          {pieData.length > 0 ? (
            <div className="w-full h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500">
              No expenses recorded yet.
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 justify-center">
            {pieData.slice(0, 4).map((entry, i) => (
              <span key={entry.name} className="text-[10px] text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {entry.name}
              </span>
            ))}
          </div>
        </SpatialCard>

        {/* Budgets & Overspend Alerts */}
        <SpatialCard className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Category Spending Ceilings
              </h3>
              <span className="text-xs text-slate-400">Budget limits and overspend warnings</span>
            </div>
            <button
              onClick={() => setShowSetBudget(true)}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Adjust
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {Object.keys(expenseByCategory).slice(0, 4).map(cat => {
              const spent = expenseByCategory[cat] || 0;
              const limit = 5000; // default baseline or stored
              const ratio = Math.min(100, Math.round((spent / limit) * 100));
              const isOver = spent > limit;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{cat}</span>
                    <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {currency}{spent.toLocaleString()} / {currency}{limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : ratio > 80 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>
                  {isOver && (
                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Budget ceiling exceeded by {currency}{(spent - limit).toLocaleString()}!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </SpatialCard>
      </div>

      {/* Savings Goals Row */}
      {savingsGoals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Noble Savings Goals</span>
            </h3>
            <button
              onClick={() => setShowAddGoal(true)}
              className="text-xs text-amber-400 font-bold hover:underline"
            >
              + Add Goal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savingsGoals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <SpatialCard key={goal.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                      <span className="text-[11px] text-slate-400">Target: {goal.targetDate}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{percent}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>{currency}{goal.currentAmount.toLocaleString()} saved</span>
                    <span>Target: {currency}{goal.targetAmount.toLocaleString()}</span>
                  </div>
                </SpatialCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions Ledger */}
      <SpatialCard className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Transaction Ledger
            </h3>
            <span className="text-xs text-slate-400">Local offline record</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search note, category..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
          {filteredTx.map(tx => (
            <div
              key={tx.id}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${
                  tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{tx.note}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>{tx.category}</span>
                    <span>·</span>
                    <span>{tx.date}</span>
                    <span>·</span>
                    <span>{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-xs font-black ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                </span>
                <button
                  onClick={(e) => handleDeleteTx(tx.id, e)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SpatialCard>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddTx}
        onClose={() => setShowAddTx(false)}
        onTransactionAdded={() => loadData()}
      />

      <SetBudgetModal
        isOpen={showSetBudget}
        onClose={() => setShowSetBudget(false)}
        onBudgetsUpdated={() => loadData()}
      />

      <AddSavingsGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onGoalAdded={() => loadData()}
      />
    </div>
  );
}

