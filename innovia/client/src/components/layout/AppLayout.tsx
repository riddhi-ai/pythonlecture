import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CommandBar } from '../common/CommandBar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-body selection:bg-blush">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <CommandBar />
    </div>
  );
};
