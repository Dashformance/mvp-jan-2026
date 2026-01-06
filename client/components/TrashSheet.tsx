import { Trash2, RotateCcw, XCircle, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_URL } from "@/app/page";

interface TrashSheetProps {
    onRestore: (id: string) => void;
    onDeleteForever: (id: string) => void;
}

export function TrashSheet({ onRestore, onDeleteForever }: TrashSheetProps) {
    const [trashedLeads, setTrashedLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchTrashed = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/leads/trashed`);
            if (res.ok) {
                const data = await res.json();
                setTrashedLeads(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar lixeira");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchTrashed();
    }, [isOpen]);

    const handleRestore = async (id: string) => {
        try {
            await fetch(`${API_URL}/leads/${id}/restore`, { method: "POST" });
            toast.success("Lead restaurado!");
            setTrashedLeads(prev => prev.filter(l => l.id !== id));
            onRestore(id);
        } catch {
            toast.error("Erro ao restaurar");
        }
    };

    const handleDeleteForever = async (id: string) => {
        try {
            await fetch(`${API_URL}/leads/${id}/hard-delete`, { method: "DELETE" });
            toast.success("Lead excluído permanentemente");
            setTrashedLeads(prev => prev.filter(l => l.id !== id));
            onDeleteForever(id);
        } catch {
            toast.error("Erro ao excluir permanentemente");
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/10 bg-[#141414] text-white overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Lixeira
                    </SheetTitle>
                    <p className="text-sm text-gray-400">
                        Leads excluídos ficam aqui. Restaure-os ou exclua permanentemente.
                    </p>
                </SheetHeader>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : trashedLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Trash2 className="h-12 w-12 mb-4 opacity-20" />
                        <p>Lixeira vazia</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trashedLeads.map((lead) => (
                            <div key={lead.id} className="p-4 rounded-lg border border-white/5 bg-[#1C1C1C] flex items-center justify-between group hover:border-white/10 transition-colors">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-white/90">{lead.company_name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>CNPJ: {lead.cnpj}</span>
                                        <span>•</span>
                                        <span>Excluído em {new Date(lead.deletedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRestore(lead.id)}
                                        className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        title="Restaurar"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteForever(lead.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        title="Excluir Permanentemente"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
