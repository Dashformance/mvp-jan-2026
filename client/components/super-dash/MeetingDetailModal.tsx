"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, BadgeAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { updateMeetingStatus } from '@/app/actions/meeting-actions';
import { toast } from 'sonner';

interface MeetingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: any;
    onUpdate?: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ isOpen, onClose, meeting, onUpdate }) => {
    if (!meeting) return null;

    const handleStatusUpdate = async (type: string, status?: string) => {
        const res = await updateMeetingStatus(meeting.id, type, status);
        if (res.success) {
            toast.success('Status atualizado');
            onUpdate?.();
            onClose();
        } else {
            toast.error('Erro ao atualizar status');
        }
    };

    const getStatusConfig = (type: string, status: string) => {
        if (status === 'CONFIRMED') return { label: 'Confirmado', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        if (type === 'FOLLOW_UP') return { label: 'Follow Up', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' };
        if (type === 'CONFIRMATION') return { label: 'A Confirmar', icon: BadgeAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' };
        return { label: 'Agendada', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    };

    const statusConfig = getStatusConfig(meeting.meetingType, meeting.meeting_status);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="absolute top-6 right-6 rounded-full hover:bg-gray-100 h-10 w-10"
                            >
                                <X className="w-5 h-5" />
                            </Button>

                            <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6",
                                statusConfig.bg,
                                statusConfig.color
                            )}>
                                <statusConfig.icon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                {meeting.title}
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="p-8 pt-0 space-y-8">
                            {/* Status Selector */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <BadgeAlert className="w-3 h-3" /> Alterar Status
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate('FOLLOW_UP', 'PENDING')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                            meeting.meetingType === 'FOLLOW_UP' && meeting.meeting_status !== 'CONFIRMED'
                                                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                                                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                        )}
                                    >
                                        Follow Up
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('CONFIRMATION', 'PENDING')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                            meeting.meetingType === 'CONFIRMATION' && meeting.meeting_status !== 'CONFIRMED'
                                                ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                                                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                        )}
                                    >
                                        A Confirmar
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('SCHEDULED', 'CONFIRMED')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                            meeting.meeting_status === 'CONFIRMED'
                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                        )}
                                    >
                                        Confirmado
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Data
                                    </span>
                                    <p className="text-sm font-bold text-gray-700">
                                        {format(meeting.dateObj, "dd 'de' MMMM", { locale: ptBR })}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Horário
                                    </span>
                                    <p className="text-sm font-bold text-gray-700">
                                        {format(meeting.dateObj, "HH:mm")}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" /> Consultor
                                    </span>
                                    <p className="text-sm font-bold text-gray-700">
                                        {meeting.ownerName}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <BadgeAlert className="w-3 h-3" /> Status Kanban
                                    </span>
                                    <div className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 w-fit uppercase">
                                        {meeting.lead_status || 'NEW'}
                                    </div>
                                </div>
                            </div>

                            {meeting.notes && (
                                <div className="space-y-3 p-5 bg-gray-50 rounded-[20px] border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Notas
                                    </span>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                        "{meeting.notes}"
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <Button className="flex-1 h-12 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold shadow-lg shadow-black/10 transition-transform active:scale-95">
                                    Ver no Kanban
                                </Button>
                                <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl border-gray-200 text-gray-500 font-bold transition-transform active:scale-95">
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
