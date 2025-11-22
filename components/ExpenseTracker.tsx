
import React, { useState } from 'react';
import { BudgetPeriod, Expense } from '../types';
import { CameraIcon, PlusIcon, ArrowLeftIcon, TagIcon } from './icons';
import Camera from './Camera';

interface ExpenseTrackerProps {
  budget: BudgetPeriod;
  expenses: Expense[];
  onAddExpense?: (expense: Omit<Expense, 'id'>) => void;
  onShowReportModal: () => void;
  readOnly?: boolean;
  onBack?: () => void;
}

const AddExpenseForm: React.FC<{
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (imageDataUrl: string) => {
    setReceipt(imageDataUrl);
    setShowCamera(false); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description.trim()) {
      onAdd({
        amount: parseFloat(amount),
        description: description.trim(),
        receipt: receipt || undefined, 
      });
    } else {
      alert('Por favor, preencha o valor e a descrição do gasto.');
    }
  };

  if (showCamera) {
    return <Camera onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <h3 className="text-xl font-bold mb-4">Adicionar Despesa</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Valor (R$)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              placeholder="0,00"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-2"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição do Gasto
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mercado, Luz, Combustível..."
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Foto / Comprovante (Opcional)</label>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CameraIcon className="w-5 h-5" />
              {receipt ? 'Foto capturada' : 'Tirar Foto'}
            </button>
            {receipt && <img src={receipt} alt="Preview" className="mt-2 rounded-md max-h-40 mx-auto" />}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  budget,
  expenses,
  onAddExpense,
  onShowReportModal,
  readOnly = false,
  onBack
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <header className="bg-white shadow-md px-4 pb-4 sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          {readOnly && onBack && (
             <button 
               onClick={onBack}
               className="mt-1 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
               aria-label="Voltar"
             >
               <ArrowLeftIcon className="w-6 h-6" />
             </button>
          )}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide font-semibold text-indigo-500 mb-1">
                {readOnly ? 'Histórico Mensal' : 'Controle Atual'}
            </p>
            <h1 className="text-2xl font-bold text-slate-800">{budget.month}</h1>
            <div className="flex flex-col text-sm text-gray-600 mt-1">
               {budget.goal && <span className="italic text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md self-start mb-1">Meta: {budget.goal}</span>}
              <span>Início: {new Date(budget.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Lançamentos</h2>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Total do Mês</p>
            <p className="font-bold text-2xl text-indigo-600">R$ {total.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhuma despesa neste mês.</p>
            {!readOnly && <p className="text-gray-400 text-sm mt-2">Clique em '+' para lançar um gasto.</p>}
          </div>
        ) : (
          <ul className="space-y-3">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full flex-shrink-0">
                    <TagIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{expense.description}</p>
                    <p className="text-lg font-bold text-gray-900">
                      R$ {expense.amount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {expense.receipt ? (
                  <button
                    onClick={() => setViewingImage(expense.receipt!)}
                    className="w-16 h-16 rounded-md overflow-hidden border-2 border-gray-200 flex-shrink-0 ml-2"
                    title="Ver foto"
                  >
                    <img src={expense.receipt} alt="Nota Fiscal" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center flex-shrink-0 ml-2">
                    Sem foto
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {!readOnly && (
        <div className="fixed right-4 z-20 flex flex-col items-center gap-3 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      <div className="fixed left-4 z-20 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={onShowReportModal}
          className={`${readOnly ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-full py-2 px-4 text-sm shadow-lg focus:outline-none transition-colors`}
        >
          {readOnly ? 'Gerar Relatórios (PDF)' : 'Relatórios e Fechamento'}
        </button>
      </div>

      {isAdding && !readOnly && onAddExpense && (
        <AddExpenseForm
          onAdd={(expense) => {
            onAddExpense(expense);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={() => setViewingImage(null)}
        >
          <img src={viewingImage} alt="Comprovante Ampliado" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
