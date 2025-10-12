import React from 'react';

// Course Card Skeleton
export const CourseCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full"></div>
        <div className="p-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        </div>
    </div>
);

// Dashboard Stats Skeleton
export const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton = () => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5 }) => (
    <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
            <TableRowSkeleton key={i} />
        ))}
    </div>
);

// Simple Loading Spinner
export const Spinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-16 w-16 border-4'
    };

    return (
        <div className="flex justify-center items-center">
            <div className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin`}></div>
        </div>
    );
};

// Full Page Loading
export const FullPageLoader = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">טוען...</p>
    </div>
);