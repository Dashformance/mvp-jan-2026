'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { searchLeadsAction, scheduleMeeting } from '@/app/actions/meeting-actions';
import { Calendar as CalendarIcon, Clock, Users, Loader2, Search, Plus, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useGamification } from '@/hooks/useGamification';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface AddMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddMeetingModal: React.FC<AddMeetingModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { addXP } = useGamification();
    const [loading, setLoading] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);

    // Meeting Details
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState('10:00');
    const [participants, setParticipants] = useState('');
    const [meetingType, setMeetingType] = useState('SCHEDULED');

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2 && !selectedLead) {
                setIsSearching(true);
                const results = await searchLeadsAction(searchTerm);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedLead]);

    const handleSelectLead = (lead: any) => {
        setSelectedLead(lead);
        setSearchTerm(lead.trade_name || lead.company_name);
        setSearchResults([]);
    };

    const clearSelection = () => {
        setSelectedLead(null);
        setSearchTerm('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        setLoading(true);

        try {
            const DateTime = new Date(`${date}T${time}:00`);

            await scheduleMeeting({
                leadId: selectedLead.id,
                date: DateTime,
                participants: participants.split(',').map(p => p.trim()).filter(Boolean),
                meetingType
            });

            // Gamification Trigger
            addXP('LEAD_QUALIFIED');

            // Notify parent to revalidate data
            onSuccess?.();

            onClose();
            // Reset
            clearSelection();
            setParticipants('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#F5F5F7] text-gray-900 border-none shadow-2xl rounded-3xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-black text-gray-900">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        Agendar Reunião
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* SEARCH LEAD */}
                    <div className="space-y-2 relative">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Buscar Lead</Label>
                        <div className="relative">
                            <Input
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedLead) setSelectedLead(null); // Clear selection if user types
                                }}
                                placeholder="Digite o nome da empresa..."
                                className="bg-white border-0 py-5 pl-10 text-gray-900 font-bold shadow-sm rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                                required
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />

                            {/* Loading Indicator */}
                            {isSearching && (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3 top-3.5" />
                            )}

                            {/* Clear Selection Button */}
                            {selectedLead && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="absolute right-3 top-3.5 text-xs font-bold text-red-500 hover:text-red-700"
                                >
                                    Trocar
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && !selectedLead && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-[200px] overflow-y-auto">
                                {searchResults.map((lead) => (
                                    <button
                                        key={lead.id}
                                        type="button"
                                        onClick={() => handleSelectLead(lead)}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                    >
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{lead.trade_name || lead.company_name}</p>
                                            {lead.owner_user?.name && (
                                                <p className="text-[10px] text-gray-400">Dono: {lead.owner_user.name}</p>
                                            )}
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600">
                                            <Plus className="w-3 h-3" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Indicator */}
                        {selectedLead && (
                            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-green-700">Lead selecionado!</span>
                            </div>
                        )}
                    </div>

                    {/* DATE & TIME */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-white border-0 py-5 pl-10 text-gray-900 font-bold shadow-sm rounded-xl"
                                    required
                                />
                                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Horário</Label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="bg-white border-0 py-5 pl-10 text-gray-900 font-bold shadow-sm rounded-xl"
                                    required
                                />
                                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Participantes (Opcional)</Label>
                        <div className="relative">
                            <Input
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                                placeholder="Ex: João, Maria..."
                                className="bg-white border-0 py-5 pl-10 text-gray-900 font-medium shadow-sm rounded-xl"
                            />
                            <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                    </div>

                    {/* MEETING TYPE */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Reunião</Label>
                        <Select value={meetingType} onValueChange={setMeetingType}>
                            <SelectTrigger className="w-full bg-white border-0 py-6 text-gray-900 font-bold shadow-sm rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-400" />
                                    <SelectValue placeholder="Selecione o tipo" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl">
                                <SelectItem value="CONFIRMATION" className="text-gray-700 font-medium hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        A confirmar reunião
                                    </div>
                                </SelectItem>
                                <SelectItem value="FOLLOW_UP" className="text-gray-700 font-medium hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        Follow up especial
                                    </div>
                                </SelectItem>
                                <SelectItem value="SCHEDULED" className="text-gray-700 font-medium hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Reunião agendada
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="mt-8">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#1C1C1C] text-[#D4C39C] hover:bg-black font-bold px-8 rounded-xl shadow-lg shadow-black/10"
                            disabled={loading || !selectedLead}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Agendamento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
