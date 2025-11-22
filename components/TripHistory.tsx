
import React, { useState } from 'react';
import { BudgetRecord } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface TripHistoryProps {
  trips: BudgetRecord[];
  onStartNewTrip: () => void;
  onDeleteTrip: (id: number) => void;
  onSelectTrip: (record: BudgetRecord) => void;
}

const TripHistory: React.FC<TripHistoryProps> = ({ trips, onStartNewTrip, onDeleteTrip, onSelectTrip }) => {
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  
  const grandTotal = trips.reduce((sum, record) => sum + record.total, 0);

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId !== null) {
      onDeleteTrip(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Encontrar o registro sendo deletado para mostrar o nome no modal
  const recordToDelete = trips.find(t => t.id === deleteConfirmationId);

  return (
    <div className="min-h-screen bg-slate-100 relative">
      <header className="bg-white shadow-md px-4 pb-4 sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Meus Meses</h1>
          <button
            onClick={onStartNewTrip}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition text-sm"
            aria-label="Iniciar novo mês"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Novo Mês</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Resumo Geral / Anual Simplificado */}
        <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg mb-6">
             <p className="text-indigo-200 text-sm font-medium uppercase">Balanço Total Acumulado</p>
             <p className="text-4xl font-bold mt-1">R$ {grandTotal.toFixed(2).replace('.', ',')}</p>
             <p className="text-indigo-300 text-xs mt-2">Soma de todos os fechamentos mensais realizados.</p>
        </div>

        <h2 className="text-lg font-semibold text-slate-700 mb-3">Histórico de Fechamentos</h2>

        {trips.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-300 rounded-lg bg-white">
            <h2 className="text-xl font-semibold text-slate-700">Nenhum registro encontrado.</h2>
            <p className="text-slate-500 mt-2">Comece agora clicando em "Novo Mês".</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {[...trips].reverse().map((record) => (
              <li 
                key={record.id} 
                onClick={() => onSelectTrip(record)}
                className="bg-white p-5 rounded-xl shadow-md transition-transform hover:scale-[1.01] active:bg-slate-50 cursor-pointer border-l-4 border-indigo-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{record.budget.month}</h3>
                    {record.budget.goal && <p className="text-sm text-slate-600 mt-1 italic">Meta: {record.budget.goal}</p>}
                    <p className="text-xs text-slate-400 mt-2">Iniciado em: {new Date(record.budget.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase">Gasto Total</p>
                      <p className="text-xl font-extrabold text-indigo-600">R$ {record.total.toFixed(2).replace('.', ',')}</p>
                    </div>
                     <button
                        onClick={(e) => handleDeleteClick(e, record.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Excluir registro"
                        title="Excluir mês"
                        >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmationId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={cancelDelete}>
          <div 
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Mês?</h3>
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja apagar o histórico de <strong>{recordToDelete?.budget.month}</strong>? 
              <br/><br/>
              <span className="text-red-500 text-sm">Esta ação é irreversível e apagará todos os lançamentos deste período.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;
