"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, MessageCircle, Mail, Trash2, Edit2, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { ContactForm } from "./ContactForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Contact {
    id: string;
    name: string;
    role?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    is_primary: boolean;
    notes?: string;
}

interface ContactListProps {
    leadId: string;
    initialContacts?: Contact[];
    onChange?: (contacts: Contact[]) => void;
}

export function ContactList({ leadId, initialContacts, onChange }: ContactListProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchContacts = async () => {
        if (!leadId || leadId === 'new') {
            if (initialContacts) setContacts(initialContacts);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Fetch directly from API
            const res = await fetch(`/api/contacts?lead_id=${leadId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setContacts(data);
        } catch (err) {
            toast.error("Erro ao carregar contatos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [leadId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este contato?")) return;

        if (!leadId || leadId === 'new') {
            const newContacts = contacts.filter(c => c.id !== id);
            setContacts(newContacts);
            onChange?.(newContacts);
            toast.success("Contato removido (draft).");
            return;
        }

        try {
            const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Contato removido.");
            fetchContacts();
        } catch {
            toast.error("Erro ao remover contato.");
        }
    };

    const handleTogglePrimary = async (contact: Contact) => {
        if (contact.is_primary) return; // Already primary

        if (!leadId || leadId === 'new') {
            const newContacts = contacts.map(c => ({
                ...c,
                is_primary: c.id === contact.id
            }));
            setContacts(newContacts);
            onChange?.(newContacts);
            toast.success("Contato principal atualizado (draft).");
            return;
        }

        try {
            const res = await fetch(`/api/contacts/${contact.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_primary: true }),
            });
            if (!res.ok) throw new Error();
            toast.success("Contato principal atualizado.");
            fetchContacts();
        } catch {
            toast.error("Erro ao atualizar primário.");
        }
    };

    const handleCreateOrUpdate = async (contactData?: any) => {
        setIsDialogOpen(false);
        setEditingContact(null);

        if ((!leadId || leadId === 'new') && contactData) {
            // Handle local update/create
            let newContacts = [...contacts];
            if (contactData.id && contacts.find(c => c.id === contactData.id)) {
                newContacts = newContacts.map(c => c.id === contactData.id ? contactData : c);
            } else {
                newContacts.push({ ...contactData, id: `temp-${Date.now()}` });
            }

            // If this is the first contact, make it primary automatically
            if (newContacts.length === 1) newContacts[0].is_primary = true;

            setContacts(newContacts);
            onChange?.(newContacts);
            return;
        }

        fetchContacts();
    };

    const logInteraction = async (type: string, detail: string) => {
        try {
            await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: leadId,
                    type,
                    content: `Contato via ${detail} (Lista de Contatos)`,
                    date: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error("Failed to log interaction", e);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                    <User className="w-4 h-4 text-accent" /> Contatos
                </h4>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setEditingContact(null)}>
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <ContactForm
                            leadId={leadId}
                            contact={editingContact}
                            onSuccess={handleCreateOrUpdate}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-xs text-muted-foreground">Carregando contatos...</div>
                ) : contacts.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic text-center py-4 border border-dashed rounded-lg border-white/10">
                        Nenhum contato adicionado.
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className={`p-3 rounded-lg border transition-colors relative group ${contact.is_primary
                                ? "bg-accent/5 border-accent/20"
                                : "bg-muted/30 border-white/5 hover:bg-muted/50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-foreground">{contact.name}</span>
                                        {contact.is_primary && (
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-accent/10 text-accent border-accent/20 px-1.5 flex gap-1">
                                                <Star className="w-3 h-3 fill-accent" /> Principal
                                            </Badge>
                                        )}
                                        {contact.role && (
                                            <span className="text-xs text-muted-foreground">({contact.role})</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:text-white"
                                        title={contact.is_primary ? "Já é principal" : "Marcar como principal"}
                                        disabled={contact.is_primary}
                                        onClick={() => handleTogglePrimary(contact)}
                                    >
                                        <Star className={`w-3 h-3 ${contact.is_primary ? 'fill-accent text-accent' : ''}`} />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:text-sky-400"
                                        onClick={() => {
                                            setEditingContact(contact);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:text-rose-400"
                                        onClick={() => handleDelete(contact.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {contact.whatsapp && (
                                    <a
                                        href={`https://wa.me/55${contact.whatsapp.replace(/\D/g, "")}`}
                                        target="_blank"
                                        onClick={() => logInteraction('WHATSAPP', 'WhatsApp')}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1 bg-white/5 rounded-md border border-white/5 hover:border-emerald-500/30"
                                    >
                                        <MessageCircle className="w-3 h-3" /> {contact.whatsapp}
                                    </a>
                                )}
                                {contact.phone && (
                                    <a
                                        href={`tel:${contact.phone}`}
                                        onClick={() => logInteraction('CALL', 'Telefone')}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors px-2 py-1 bg-white/5 rounded-md border border-white/5"
                                    >
                                        <Phone className="w-3 h-3" /> {contact.phone}
                                    </a>
                                )}
                                {contact.email && (
                                    <a
                                        href={`mailto:${contact.email}`}
                                        onClick={() => logInteraction('EMAIL', 'Email')}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-sky-400 transition-colors px-2 py-1 bg-white/5 rounded-md border border-white/5 hover:border-sky-500/30"
                                    >
                                        <Mail className="w-3 h-3" /> {contact.email}
                                    </a>
                                )}
                            </div>
                            {contact.notes && (
                                <p className="text-[10px] text-muted-foreground mt-2 italic border-t border-white/5 pt-1 w-full truncate">
                                    {contact.notes}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
