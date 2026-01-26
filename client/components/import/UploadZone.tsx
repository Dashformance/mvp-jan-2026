"use client";

import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isAnalyzing: boolean;
    error?: string;
}

export function UploadZone({ onFileSelect, isAnalyzing, error }: UploadZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false,
        disabled: isAnalyzing
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group",
                    isDragActive ? "border-amber-500 bg-amber-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                    isAnalyzing && "opacity-50 cursor-not-allowed",
                    error && "border-rose-500/50 bg-rose-500/5"
                )}
            >
                <input {...getInputProps()} />

                {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Analisando arquivo...</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Upload className="w-8 h-8 text-white/50 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white mb-1">
                                {isDragActive ? "Solte o arquivo aqui" : "Arraste e solte sua planilha"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Suporta CSV, Excel (.xlsx, .xls)
                            </p>
                            <Button variant="secondary" className="mt-4 pointer-events-none">
                                Selecionar Arquivo
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 mt-4 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
