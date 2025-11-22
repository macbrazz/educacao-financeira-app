
import React, { useState, useEffect, useCallback } from 'react';
import { BudgetPeriod, Expense, BudgetRecord } from './types';
import TripSetup from './components/TripSetup';
import ExpenseTracker from './components/ExpenseTracker';
import TripHistory from './components/TripHistory';

// To satisfy TypeScript since jsPDF is loaded from a script tag
declare const window: any;

const ReportModal: React.FC<{
    budget: BudgetPeriod;
    expenses: Expense[];
    onClose: () => void;
    onEndBudget: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
    isHistoryView?: boolean;
}> = ({ budget, expenses, onClose, onEndBudget, setIsGenerating, isHistoryView = false }) => {

    const downloadPdf = (doc: any, filename: string) => {
        try {
            doc.save(filename);
        } catch (e) {
            console.warn("doc.save() failed, falling back to opening in a new tab.", e);
            try {
                doc.output('dataurlnewwindow', { filename: filename });
            } catch (e2) {
                console.error("Fallback PDF method also failed:", e2);
                alert("Ocorreu um erro ao gerar o PDF.");
            }
        }
    };

    const generatePdf = async (type: 'summary' | 'detailed') => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 50)); 

        try {
            const { jsPDF } = window.jspdf;

            if (type === 'summary') {
                const summaryDoc = new jsPDF();
                
                summaryDoc.setFontSize(22);
                summaryDoc.text("Relatório Financeiro Mensal", 105, 20, { align: 'center' });
                
                summaryDoc.setFontSize(12);
                summaryDoc.text(`Mês de Referência: ${budget.month}`, 15, 40);
                if (budget.goal) summaryDoc.text(`Meta Financeira: ${budget.goal}`, 15, 48);
                summaryDoc.text(`Data de Início: ${new Date(budget.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}`, 15, 56);
                
                const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                summaryDoc.setFontSize(16);
                summaryDoc.text(`Total de Gastos: R$ ${total.toFixed(2).replace('.', ',')}`, 15, 70);
                
                if (expenses.length > 0) {
                    summaryDoc.setFontSize(14);
                    summaryDoc.text("Extrato de Despesas", 15, 85);
                    let yPos = 95;
                    expenses.forEach((exp, index) => {
                        if (yPos > 270) {
                            summaryDoc.addPage();
                            yPos = 20;
                        }
                        summaryDoc.setFontSize(11);
                        summaryDoc.text(`${index + 1}. ${exp.description}: R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 20, yPos);
                        yPos += 7;
                    });
                } else {
                     summaryDoc.setFontSize(12);
                     summaryDoc.text("Nenhuma despesa registrada neste mês.", 15, 85);
                }

                downloadPdf(summaryDoc, `resumo_${budget.month.replace(/\//g, '-')}.pdf`);

            } else if (type === 'detailed') {
                if (expenses.length === 0) {
                    alert('Nenhum gasto foi registrado para gerar o relatório.');
                    setIsGenerating(false);
                    return;
                }

                const detailedDoc = new jsPDF();
                detailedDoc.setFontSize(22);
                detailedDoc.text("Relatório Detalhado", 105, 15, { align: 'center' });
                detailedDoc.setFontSize(10);
                detailedDoc.text(`Período: ${budget.month}`, 105, 22, { align: 'center' });

                expenses.forEach((exp, index) => {
                    if (index > 0) detailedDoc.addPage();

                    detailedDoc.setFontSize(14);
                    detailedDoc.text(`Lançamento ${index + 1}`, 15, 20);
                    
                    detailedDoc.setFontSize(12);
                    detailedDoc.text(`Descrição: ${exp.description}`, 15, 30);
                    detailedDoc.text(`Valor: R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 15, 38);
                    
                    if (exp.receipt) {
                        try {
                            const img = new Image();
                            img.src = exp.receipt;
                            const imgProps = detailedDoc.getImageProperties(img.src);
                            const pdfWidth = detailedDoc.internal.pageSize.getWidth();
                            const pdfHeight = detailedDoc.internal.pageSize.getHeight();
                            const margin = 15;
                            const availableWidth = pdfWidth - 2 * margin;
                            const availableHeight = pdfHeight - 50; 
                            const aspectRatio = imgProps.width / imgProps.height;
                            let imgWidth = availableWidth;
                            let imgHeight = imgWidth / aspectRatio;
                            if (imgHeight > availableHeight) {
                                imgHeight = availableHeight;
                                imgWidth = imgHeight * aspectRatio;
                            }
                            const x = (pdfWidth - imgWidth) / 2;
                            detailedDoc.addImage(exp.receipt, 'JPEG', x, 45, imgWidth, imgHeight);
                        } catch(e) {
                            console.error("Error adding image to PDF:", e);
                            detailedDoc.text("Erro ao carregar imagem do comprovante.", 15, 50);
                        }
                    } else {
                        detailedDoc.setFontSize(11);
                        detailedDoc.setTextColor(100); 
                        detailedDoc.text("Sem foto anexada.", 15, 50);
                        detailedDoc.setTextColor(0); 
                    }
                });
                
                downloadPdf(detailedDoc, `relatorio_detalhado_${budget.month.replace(/\//g, '-')}.pdf`);
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Ocorreu um erro ao gerar o PDF.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 text-center animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isHistoryView ? "Relatórios" : "Fechamento"}</h2>
                <p className="text-slate-500 mb-6">
                    {isHistoryView 
                        ? "Gere segundas vias dos relatórios deste mês." 
                        : "Gere os relatórios e encerre o mês atual para salvar no histórico anual."
                    }
                </p>
                <div className="space-y-3">
                    <button onClick={() => generatePdf('summary')} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        Gerar Resumo (PDF)
                    </button>
                    <button onClick={() => generatePdf('detailed')} className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
                        Gerar Detalhado (PDF)
                    </button>
                    
                    {!isHistoryView && (
                        <>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                            </div>
                            <button onClick={onEndBudget} className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                                Fechar Mês
                            </button>
                        </>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 text-slate-500 hover:text-slate-700 text-sm">
                    Voltar
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    // Using 'currentBudget' key for storage to differentiate from old 'currentTrip'
    const [currentBudget, setCurrentBudget] = useState<BudgetPeriod | null>(() => {
        try {
            const stored = localStorage.getItem('currentBudget');
            // Fallback to check if there is old trip data we might want to migrate or ignore
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    });
    
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        try {
            if (localStorage.getItem('currentBudget')) {
                const storedExpenses = localStorage.getItem('currentExpenses');
                return storedExpenses ? JSON.parse(storedExpenses) : [];
            }
            return [];
        } catch (error) {
            return [];
        }
    });

    const [budgetHistory, setBudgetHistory] = useState<BudgetRecord[]>(() => {
        try {
            const storedHistory = localStorage.getItem('budgetHistory');
            // Check if there is old trip history to migrate conceptually? 
            // For now, we start a new history key 'budgetHistory' to not break old apps but start fresh with new logic.
            // Or we could map old history to new structure if needed, but cleaner to start fresh or use different key.
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (error) {
            return [];
        }
    });

    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<BudgetRecord | null>(null);

    // --- Data Persistence Effects ---

    useEffect(() => {
        try {
            if (currentBudget) {
                localStorage.setItem('currentBudget', JSON.stringify(currentBudget));
            } else {
                localStorage.removeItem('currentBudget');
                localStorage.removeItem('currentExpenses');
            }
        } catch (error) {
            console.error("LocalStorage Error", error);
        }
    }, [currentBudget]);

    useEffect(() => {
        try {
            if (currentBudget) {
                localStorage.setItem('currentExpenses', JSON.stringify(expenses));
            }
        } catch (error) {
             console.error("LocalStorage Error", error);
        }
    }, [expenses, currentBudget]);


    useEffect(() => {
        try {
            localStorage.setItem('budgetHistory', JSON.stringify(budgetHistory));
        } catch (error) {
             console.error("LocalStorage Error", error);
        }
    }, [budgetHistory]);
    
    // --- App Logic ---

    const handleStartBudget = (budget: BudgetPeriod) => {
        setCurrentBudget(budget);
        setExpenses([]);
        setIsSetupOpen(false);
        setViewingHistoryItem(null);
    };

    const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            ...expense,
            id: Date.now(),
        };
        setExpenses(prev => [...prev, newExpense]);
    };

    const handleEndBudget = useCallback(() => {
        if (!currentBudget) return;

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const newRecord: BudgetRecord = {
            id: Date.now(),
            budget: currentBudget,
            expenses: expenses,
            total: total,
        };

        setBudgetHistory(prev => [...prev, newRecord]);
        setCurrentBudget(null);
        setExpenses([]);
        setIsReportModalOpen(false);
    }, [currentBudget, expenses]);

    const handleDeleteRecord = (id: number) => {
        setBudgetHistory(prev => prev.filter(r => r.id !== id));
        if (viewingHistoryItem && viewingHistoryItem.id === id) {
            setViewingHistoryItem(null);
        }
    };
    
    const handleSelectHistoryRecord = (record: BudgetRecord) => {
        setViewingHistoryItem(record);
    };

    useEffect(() => {
        const hasActive = !!localStorage.getItem('currentBudget');
        const storedHistory = localStorage.getItem('budgetHistory');
        const hasHistory = storedHistory && JSON.parse(storedHistory).length > 0;
        
        if (!hasActive && !hasHistory) {
            setIsSetupOpen(true);
        }
    }, []);

    const activeData = currentBudget 
        ? { budget: currentBudget, expenses: expenses } 
        : (viewingHistoryItem ? { budget: viewingHistoryItem.budget, expenses: viewingHistoryItem.expenses } : null);

    // --- Render ---
    
    return (
        <>
            {isGenerating && (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-[100] flex items-center justify-center">
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-3 text-slate-700 font-semibold">Gerando PDF...</p>
                    </div>
                </div>
            )}

            <TripSetup 
                isOpen={isSetupOpen} 
                onStart={handleStartBudget} 
                onClose={() => setIsSetupOpen(false)} 
            />

            {isReportModalOpen && activeData && (
                <ReportModal 
                    budget={activeData.budget}
                    expenses={activeData.expenses}
                    onClose={() => setIsReportModalOpen(false)}
                    onEndBudget={handleEndBudget}
                    setIsGenerating={setIsGenerating}
                    isHistoryView={!!viewingHistoryItem && !currentBudget}
                />
            )}

            {currentBudget ? (
                <ExpenseTracker
                    budget={currentBudget}
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onShowReportModal={() => setIsReportModalOpen(true)}
                />
            ) : viewingHistoryItem ? (
                 <ExpenseTracker
                    budget={viewingHistoryItem.budget}
                    expenses={viewingHistoryItem.expenses}
                    onShowReportModal={() => setIsReportModalOpen(true)}
                    readOnly={true}
                    onBack={() => setViewingHistoryItem(null)}
                />
            ) : (
                <TripHistory
                    trips={budgetHistory}
                    onStartNewTrip={() => setIsSetupOpen(true)}
                    onDeleteTrip={handleDeleteRecord}
                    onSelectTrip={handleSelectHistoryRecord}
                />
            )}
        </>
    );
};

export default App;
