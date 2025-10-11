import  React, { useState, useEffect } from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, courseName, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Delete Course</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        disabled={isDeleting}
                    >
                        ×
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to delete <strong>{courseName}</strong>?
                    </p>
                    <p className="text-red-600 text-sm">
                        ⚠️ This action cannot be undone. All curriculum, lessons, and course data will be permanently deleted.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Course'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;