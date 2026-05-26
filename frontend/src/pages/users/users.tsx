import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import CraeteUsersPage from './componets/craeteUser/craeteusers';
import { getCurrentDateSAST } from '../../Date/dateUtils'; // Imported date utility

const Users: React.FC = () => {
  const currentDate = getCurrentDateSAST();

  return (
    <div className="page-content">
      <div className="space-y-4 sm:space-y-5">
        {/* Synchronized Header Pattern */}
        <PageHeader 
          title="User Management" 
          subtitle={`Manage users and add new accounts · ${currentDate}`} 
        />

        {/* Organized Page Content Layout */}
        <div className="users-page">
          <div className="users-panel">
            <CraeteUsersPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;