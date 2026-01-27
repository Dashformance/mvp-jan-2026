"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Phone, Mail, User, Briefcase } from "lucide-react";

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

interface ContactFormProps {
    leadId: string;
    contact?: Contact | null;
    onSuccess: (data?: any) => void;
    onCancel: () => void;
    onSubmit?: (data: any) => Promise<void>; // New prop for manual handling
}

export function ContactForm({ leadId, contact, onSuccess, onCancel, onSubmit }: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        phone: "",
        whatsapp: "",
        email: "",
        is_primary: false,
        notes: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name,
                role: contact.role || "",
                phone: contact.phone || "",
                whatsapp: contact.whatsapp || "",
                email: contact.email || "",
                is_primary: contact.is_primary,
                notes: contact.notes || ""
            });
        } else {
            // Reset for new contact
            setFormData({
                name: "",
                role: "",
                phone: "",
                whatsapp: "",
                email: "",
                is_primary: false,
                notes: ""
            });
        }
    }, [contact]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Nome é obrigatório.");
            return;
        }
        setSaving(true);

        // If manual submit handler is provided (Draft Mode)
        if (onSubmit) {
            try {
                // Ensure ID exists for draft tracking
                const draftData = { ...formData, id: contact?.id || `temp-${Date.now()}` };
                await onSubmit(draftData);
                onSuccess(draftData);
            } catch (err) {
                toast.error("Erro ao salvar contato.");
            } finally {
                setSaving(false);
            }
            return;
        }

        try {
            const url = contact ? `/api/contacts/${contact.id}` : `/api/contacts`;
            const method = contact ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, lead_id: leadId }),
            });

            if (!res.ok) throw new Error();

            toast.success(contact ? "Contato atualizado." : "Contato criado.");
            onSuccess();
        } catch {
            toast.error("Erro ao salvar contato.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 bg-[#1C1C1C] text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">{contact ? "Editar Contato" : "Novo Contato"}</h3>
            </div>

            <div className="space-y-3">
                {/* Name & Role */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Nome *</Label>
                        <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-[#888888]" />
                            <Input
                                value={formData.name}
                                onChange={e => handleChange("name", e.target.value)}
                                className="pl-9 h-9 bg-[#222222] border-white/10 text-white placeholder:text-[#444444]"
                                placeholder="Ex: Ana Silva"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Cargo</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-[#888888]" />
                            <Input
                                value={formData.role}
                                onChange={e => handleChange("role", e.target.value)}
                                className="pl-9 h-9 bg-[#222222] border-white/10 text-white placeholder:text-[#444444]"
                                placeholder="Ex: Gerente"
                            />
                        </div>
                    </div>
                </div>

                {/* Phones */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Whatsapp</Label>
                        <Input
                            value={formData.whatsapp}
                            onChange={e => handleChange("whatsapp", e.target.value)}
                            className="h-9 bg-[#222222] border-white/10 text-white placeholder:text-[#444444]"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Telefone Fixo/Cel</Label>
                        <Input
                            value={formData.phone}
                            onChange={e => handleChange("phone", e.target.value)}
                            className="h-9 bg-[#222222] border-white/10 text-white placeholder:text-[#444444]"
                            placeholder="(00) 0000-0000"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-[#888888]" />
                        <Input
                            value={formData.email}
                            onChange={e => handleChange("email", e.target.value)}
                            className="pl-9 h-9 bg-[#222222] border-white/10 text-white placeholder:text-[#444444]"
                            placeholder="email@empresa.com"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                    <Label className="text-xs">Observações</Label>
                    <Textarea
                        value={formData.notes}
                        onChange={e => handleChange("notes", e.target.value)}
                        className="h-20 resize-none text-xs bg-[#222222] border-white/10 text-white placeholder:text-[#444444]"
                        placeholder="Detalhes adicionais..."
                    />
                </div>

                {/* Primary Toggle */}
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="is_primary"
                        checked={formData.is_primary}
                        onCheckedChange={(checked) => handleChange("is_primary", checked)}
                    />
                    <Label htmlFor="is_primary" className="cursor-pointer text-sm">
                        Marcar como contato principal
                    </Label>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="text-[#888888] hover:text-white hover:bg-[#222222]">Cancelar</Button>
                <Button type="submit" disabled={saving} className="bg-[#DECCA8] text-black hover:bg-[#DECCA8]/90">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
        </form>
    );
}
