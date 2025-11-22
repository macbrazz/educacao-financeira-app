
import React, { useState, useEffect } from 'react';
import { BudgetPeriod } from '../types';

interface TripSetupProps {
  isOpen: boolean;
  onStart: (budget: BudgetPeriod) => void;
  onClose: () => void;
}

const TripSetup: React.FC<TripSetupProps> = ({ isOpen, onStart, onClose }) => {
  const [month, setMonth] = useState('');
  const [goal, setGoal] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      // Suggest current month/year as default
      const now = new Date();
      const monthName = now.toLocaleString('pt-BR', { month: 'long' });
      const year = now.getFullYear();
      setMonth(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`);
      setGoal('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (month.trim() && date) {
      onStart({ month, goal, startDate: date });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-up relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-3xl text-slate-400 hover:text-slate-600" aria-label="Fechar">
          &times;
        </button>
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Novo Mês</h1>
        <p className="text-slate-500 text-center mb-8">Defina o período e sua meta para este mês.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-slate-700">
              Mês de Referência
            </label>
            <input
              type="text"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
              placeholder="Ex: Outubro/2024"
              required
            />
          </div>
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-slate-700">
              Meta Financeira (Opcional)
            </label>
            <input
              type="text"
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
              placeholder="Ex: Gastar menos com delivery"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">
              Data de Início
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            Iniciar Controle Mensal
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripSetup;
