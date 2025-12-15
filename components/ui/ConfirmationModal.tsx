import { AlertTriangle, X } from 'lucide-react';
import ChefiniButton from './ChefiniButton';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'primary';
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Content */}
            <div className="relative bg-white border-4 border-black shadow-brutal-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 hover:opacity-50 transition-opacity"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-black" />
                    </div>

                    <h3 className="text-2xl font-black text-black mb-2 uppercase">
                        {title}
                    </h3>

                    <p className="text-gray-600 font-bold mb-8">
                        {message}
                    </p>

                    <div className="flex gap-4 w-full">
                        <ChefiniButton
                            variant="secondary"
                            onClick={onCancel}
                            className="flex-1 justify-center"
                        >
                            {cancelLabel}
                        </ChefiniButton>

                        <ChefiniButton
                            variant={variant}
                            onClick={onConfirm}
                            className="flex-1 justify-center"
                        >
                            {confirmLabel}
                        </ChefiniButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
