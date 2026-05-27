import React, { useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import CraeteUsersPage from './componets/craeteUser/craeteusers';
import UserList from './componets/userList/UserList';
import { getCurrentDateSAST } from '../../Date/dateUtils'; // Imported date utility

type User = {
  id: number;
  name: string;
  email: string;
  branch: string;
  role: string;
  status: string;
};

const initialUsers: User[] = [
  { id: 1, name: 'Sam Smith', email: 'sam@gmail.com', branch: 'Warehouse A', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Alex Johnson', email: 'alex.johnson@gmail.com', branch: 'Warehouse B', role: 'Admin', status: 'Active' },
  { id: 3, name: 'Maria Garcia', email: 'maria.garcia@gmail.com', branch: 'Warehouse A', role: 'Staff', status: 'Active' },
  { id: 4, name: 'Jordan Lee', email: 'jordan.lee@gmail.com', branch: 'Warehouse C', role: 'Staff', status: 'Pending' },
];

const Users: React.FC = () => {
  const currentDate = getCurrentDateSAST();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? undefined,
    [users, selectedUserId]
  );

  const handleSelectUser = (id: number) => {
    setSelectedUserId(id);
  };

  const handleCreateNewUser = () => {
    setSelectedUserId(null);
  };

  const handleSaveUser = (user: Omit<User, 'id'> & { id: number | null }) => {
    if (user.id === null) {
      const nextId = Math.max(0, ...users.map((item) => item.id)) + 1;
      setUsers((prev) => [...prev, { ...user, id: nextId }]);
      setSelectedUserId(nextId);
      return;
    }

    setUsers((prev) => prev.map((existing) => (existing.id === user.id ? { ...existing, ...user } : existing)));
  };

  const handleDeleteUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setSelectedUserId(null);
  };

  return (
    <div className="page-content">
      <div className="space-y-4 sm:space-y-5">
        <PageHeader 
          title="User Management" 
          subtitle={`Manage users and add new accounts · ${currentDate}`} 
        />

        <div className="users-page grid gap-4 xl:grid-cols-[2fr,1fr]">
          <div className="users-panel">
            <CraeteUsersPage
              user={selectedUser}
              onSave={handleSaveUser}
              onDelete={handleDeleteUser}
            />
          </div>
          <div className="users-panel">
            <UserList
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              onCreateNewUser={handleCreateNewUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;