import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`admin-layout ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            
            <div className="main-content">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout;
