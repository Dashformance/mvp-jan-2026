import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    format, isSameDay, addDays, startOfWeek, isToday, parseISO,
    startOfMonth, endOfMonth, endOfWeek, isSameMonth, addMonths, subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AddMeetingModal } from './AddMeetingModal';
import { Button } from '@/components/ui/button';

interface Meeting {
    id: string;
    title: string;
    date: string | Date;
    ownerName: string;
    ownerAvatar?: string;
}

interface TeamCalendarProps {
    meetings: Meeting[];
    className?: string;
}

export const TeamCalendar: React.FC<TeamCalendarProps> = ({ meetings = [], className }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
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

        return {
            ...m,
            id: m.id,
            title,
            date: rawDate,
            dateObj,
            ownerName,
            ownerAvatar
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
                                            "absolute bottom-1.5 w-1 h-1 rounded-full",
                                            isSelected ? "bg-[#D4C39C]" : "bg-[#D4C39C]" // Gold dot
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
                                {selectedMeetings.length} reuniões
                            </span>
                        )}
                    </div>

                    <AnimatePresence mode='popLayout'>
                        {selectedMeetings.length > 0 ? (
                            selectedMeetings.map((meeting, idx) => (
                                <MeetingCard key={meeting.id} meeting={meeting} index={idx} />
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

            <AddMeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

import { deleteMeeting } from '@/app/actions/meeting-actions';
import { toast } from 'sonner';

const MeetingCard = ({ meeting, index }: { meeting: any, index: number }) => {
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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center bg-white rounded-2xl p-4 shadow-sm border border-black/[0.03] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
        >
            {/* Accent Strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4C39C]" />

            {/* Time */}
            <div className="flex flex-col min-w-[3.5rem] border-r border-gray-100 pr-4 mr-4">
                <span className="text-xl font-black text-[#1C1C1C] tracking-tight">
                    {format(meeting.dateObj, 'HH:mm')}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {format(meeting.dateObj, 'EEE', { locale: ptBR })}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 overflow-hidden">
                <h4 className="text-base font-bold text-[#1C1C1C] truncate group-hover:text-[#D4C39C] transition-colors">
                    {meeting.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                    {meeting.ownerName && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            {meeting.ownerAvatar ? (
                                <img src={meeting.ownerAvatar} alt={meeting.ownerName} className="w-4 h-4 rounded-full border border-gray-100" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[8px] text-[#D4C39C] font-bold">
                                    {meeting.ownerName[0]}
                                </div>
                            )}
                            <span className="text-[10px] text-gray-500 font-bold truncate max-w-[80px]">{meeting.ownerName.split(' ')[0]}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Remover da agenda"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        </motion.div >
    );
}
