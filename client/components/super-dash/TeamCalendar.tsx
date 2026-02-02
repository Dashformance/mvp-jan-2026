"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    format, isSameDay, addDays, startOfWeek, isToday, parseISO,
    startOfMonth, endOfMonth, endOfWeek, isSameMonth, addMonths, subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AddMeetingModal } from './AddMeetingModal';
import { MeetingDetailModal } from './MeetingDetailModal';
import { Button } from '@/components/ui/button';

interface Meeting {
    id: string;
    title: string;
    date: string | Date;
    ownerName: string;
    ownerAvatar?: string;
    meetingType?: string;
}

interface TeamCalendarProps {
    meetings: Meeting[];
    className?: string;
    onMeetingChange?: () => void;
}

export const TeamCalendar: React.FC<TeamCalendarProps> = ({ meetings = [], className, onMeetingChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMeetingForDetail, setSelectedMeetingForDetail] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Parse meetings with fallback for API properties
    const parsedMeetings = meetings.map(m => {
        // Handle "next_followup_date" vs "date"
        const rawDate = m.date || (m as any).next_followup_date;
        const dateObj = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate;

        // Handle "company_name" vs "title"
        const title = m.title || (m as any).company_name || 'Sem título';

        // Handle "owner_user" nested object
        const ownerName = m.ownerName || (m as any).owner_user?.name || (m as any).owner?.name || 'N/A';
        const ownerAvatar = m.ownerAvatar || (m as any).owner_user?.avatar_url || (m as any).owner?.avatar_url;

        // Handle Meeting Type (from Prisma)
        const meetingType = m.meetingType || (m as any).meeting_type || 'SCHEDULED';
        const meetingStatus = (m as any).meeting_status || 'PENDING';
        const leadStatus = (m as any).lead_status || 'NEW';
        const notes = (m as any).notes || '';

        return {
            ...m,
            id: m.id,
            title,
            date: rawDate,
            dateObj,
            ownerName,
            ownerAvatar,
            meetingType,
            meeting_status: meetingStatus,
            lead_status: leadStatus,
            notes
        };
    });

    // Generate Month Grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = [];
    let day = startDate;
    while (day <= endDate) {
        calendarDays.push(day);
        day = addDays(day, 1);
    }

    // Get meetings for selected day
    const selectedMeetings = parsedMeetings.filter(m => isSameDay(m.dateObj, selectedDate));

    // Check availability
    const getMeetingCount = (day: Date) => parsedMeetings.filter(m => isSameDay(m.dateObj, day)).length;

    // Get priority color for a day (Amber > Green > Indigo)
    const getDayDotColor = (day: Date): string => {
        const dayMeetings = parsedMeetings.filter(m => isSameDay(m.dateObj, day));
        if (dayMeetings.length === 0) return '';

        // Priority: FOLLOW_UP (Red) > CONFIRMATION (Yellow) > SCHEDULED (Emerald/Blue)
        const hasFollowUp = dayMeetings.some(m => m.meetingType === 'FOLLOW_UP');
        const hasConfirmation = dayMeetings.some(m => m.meetingType === 'CONFIRMATION');

        if (hasFollowUp) return 'bg-red-500';
        if (hasConfirmation) return 'bg-amber-500';
        return 'bg-emerald-500'; // Default (SCHEDULED)
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "bg-[#F5F5F7] border border-white/50 rounded-[32px] p-6 w-full flex flex-col gap-6 shadow-xl shadow-black/5 relative overflow-hidden",
                    className
                )}
            >
                {/* HEADLINE & NAV */}
                <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-gray-900 font-extrabold text-2xl tracking-tight leading-none">Agenda</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-sm text-gray-400 font-bold capitalize">
                                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                                </span>
                            </div>
                        </div>

                        {/* Nav Buttons */}
                        <div className="flex items-center bg-gray-200/50 rounded-full p-1 ml-2">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-full transition-all text-gray-500 hover:shadow-sm">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-full transition-all text-gray-500 hover:shadow-sm">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <Button
                        size="icon"
                        onClick={() => setIsModalOpen(true)}
                        className="h-12 w-12 rounded-full bg-[#D4C39C] text-[#1C1C1C] hover:bg-[#C4B38C] shadow-lg shadow-[#D4C39C]/20 transition-transform active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                    </Button>
                </div>

                {/* MONTH GRID */}
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100/50 z-10 relative">
                    {/* Weekdays Header */}
                    <div className="grid grid-cols-7 mb-3">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                        {calendarDays.map((dayItem, idx) => {
                            const isSelected = isSameDay(dayItem, selectedDate);
                            const isCurrentMonth = isSameMonth(dayItem, currentMonth);
                            const isCurrentDay = isToday(dayItem);
                            const count = getMeetingCount(dayItem);
                            const hasMeetings = count > 0;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(dayItem)}
                                    className={cn(
                                        "h-9 w-full rounded-full flex flex-col items-center justify-center relative transition-all duration-200",
                                        !isCurrentMonth && "text-gray-200",
                                        isCurrentMonth && "text-gray-600 font-medium hover:bg-gray-50",
                                        isCurrentDay && !isSelected && "text-blue-600 font-extrabold",
                                        isSelected && "bg-[#1C1C1C] text-[#D4C39C] font-bold shadow-lg scale-110 z-10" // Black pill with Gold text (Ref style)
                                    )}
                                >
                                    <span className="text-xs">{format(dayItem, 'd')}</span>
                                    {hasMeetings && (
                                        <span className={cn(
                                            "absolute bottom-1.5 w-1.5 h-1.5 rounded-full",
                                            getDayDotColor(dayItem)
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* MEETING LIST - "Selected Day" Card */}
                <div className="flex flex-col gap-3 min-h-[120px] z-10 relative">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </span>
                        {selectedMeetings.length > 0 && (
                            <span className="text-[10px] font-bold bg-gray-200/80 text-gray-600 px-2.5 py-1 rounded-full">
                                {selectedMeetings.length} {selectedMeetings.length === 1 ? 'evento' : 'eventos'}
                            </span>
                        )}
                    </div>

                    <AnimatePresence mode='popLayout'>
                        {selectedMeetings.length > 0 ? (
                            selectedMeetings.map((meeting, idx) => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                    index={idx}
                                    onClick={() => {
                                        setSelectedMeetingForDetail(meeting);
                                        setIsDetailModalOpen(true);
                                    }}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/50 border border-white/60 rounded-2xl p-6 flex flex-col items-center justify-center flex-1 text-center"
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm text-gray-300">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">Livre neste dia</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AddMeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={onMeetingChange} />

            <MeetingDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                meeting={selectedMeetingForDetail}
                onUpdate={onMeetingChange}
            />
        </>
    );
};

import { deleteMeeting } from '@/app/actions/meeting-actions';
import { toast } from 'sonner';

const MeetingCard = ({ meeting, index, onClick }: { meeting: any, index: number, onClick: () => void }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja remover esta reunião?')) return;

        setIsDeleting(true);
        try {
            const res = await deleteMeeting(meeting.id);
            if (res.success) {
                toast.success('Reunião removida');
            } else {
                toast.error('Erro ao remover');
            }
        } catch (error) {
            toast.error('Erro ao remover');
        } finally {
            setIsDeleting(false);
        }
    };

    const getMeetingBgColor = (type: string, status?: string) => {
        if (status === 'CONFIRMED') return 'bg-emerald-500';
        switch (type) {
            case 'FOLLOW_UP': return 'bg-red-500';
            case 'CONFIRMATION': return 'bg-amber-400';
            case 'SCHEDULED': return 'bg-emerald-500';
            default: return 'bg-gray-900';
        }
    };

    const getMeetingTextColor = (type: string, status?: string) => {
        if (status === 'CONFIRMED') return 'text-white';
        switch (type) {
            case 'FOLLOW_UP': return 'text-white';
            case 'CONFIRMATION': return 'text-amber-950'; // High contrast for yellow
            case 'SCHEDULED': return 'text-white';
            default: return 'text-white';
        }
    };

    const getMeetingMutedTextColor = (type: string, status?: string) => {
        if (status === 'CONFIRMED') return 'text-emerald-100';
        switch (type) {
            case 'FOLLOW_UP': return 'text-red-100';
            case 'CONFIRMATION': return 'text-amber-800/80';
            case 'SCHEDULED': return 'text-emerald-100';
            default: return 'text-gray-400';
        }
    };

    const meetingBgClass = getMeetingBgColor(meeting.meetingType, meeting.meeting_status);
    const meetingTextClass = getMeetingTextColor(meeting.meetingType, meeting.meeting_status);
    const meetingMutedTextClass = getMeetingMutedTextColor(meeting.meetingType, meeting.meeting_status);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
            onClick={onClick}
            className={cn(
                "flex items-center rounded-2xl p-4 shadow-lg transition-all group cursor-pointer relative overflow-hidden border-none",
                meetingBgClass,
                meetingTextClass
            )}
        >
            {/* Accent light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

            {/* Time */}
            <div className={cn("flex flex-col min-w-14 border-r pr-4 mr-4",
                meeting.meetingType === 'CONFIRMATION' && meeting.meeting_status !== 'CONFIRMED' ? "border-amber-950/10" : "border-white/20"
            )}>
                <span className="text-xl font-black tracking-tight">
                    {format(meeting.dateObj, 'HH:mm')}
                </span>
                {/* Visible Status Tag beside time */}
                <div className={cn(
                    "px-1 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-tighter mt-1 text-center border-b-2 shadow-sm",
                    meeting.meetingType === 'FOLLOW_UP' && meeting.meeting_status !== 'CONFIRMED' ? "bg-red-600 text-white border-red-700" :
                        meeting.meetingType === 'CONFIRMATION' && meeting.meeting_status !== 'CONFIRMED' ? "bg-amber-500 text-amber-950 border-amber-600" :
                            "bg-emerald-600 text-white border-emerald-700"
                )}>
                    {meeting.meetingType === 'FOLLOW_UP' && meeting.meeting_status !== 'CONFIRMED' ? 'F-UP' :
                        meeting.meetingType === 'CONFIRMATION' && meeting.meeting_status !== 'CONFIRMED' ? 'CONF' : 'OK'}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 overflow-hidden">
                <h4 className="text-base font-black truncate group-hover:translate-x-1 transition-transform">
                    {meeting.title}
                </h4>
                {/* Secondary status text removed as we moved it to the side */}
                <div className="flex items-center gap-2 mt-1">
                    {meeting.ownerName && (
                        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md",
                            meeting.meetingType === 'CONFIRMATION' && meeting.meeting_status !== 'CONFIRMED' ? "bg-amber-500/20" : "bg-white/10"
                        )}>
                            <span className={cn("text-[9px] font-black truncate max-w-[80px] uppercase tracking-wider", meetingTextClass)}>
                                {meeting.ownerName.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                    "opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all",
                    meeting.meetingType === 'CONFIRMATION' && meeting.meeting_status !== 'CONFIRMED' ? "text-amber-950 hover:bg-amber-500/30" : "text-white hover:bg-white/20"
                )}
                title="Remover da agenda"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
