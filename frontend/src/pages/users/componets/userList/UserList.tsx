import userIcon from '../../../../assets/images/userIcon.png';
import './UserList.css';

type User = {
  id: number;
  name: string;
  email: string;
  branch: string;
  role: string;
  status: string;
};

interface UserListProps {
  users: User[];
  selectedUserId: number | null;
  // `loading` is passed from the parent `Users` component. It reflects the GET /api/User request state.
  // We render a small footer status so the overall card height doesn't jump when loading starts/stops.
  loading: boolean;
  onSelectUser: (id: number) => void;
  onCreateNewUser: () => void;
}

function UserList({ users, selectedUserId, loading, onSelectUser, onCreateNewUser }: UserListProps) {
  return (
    <section className="userlist-card">
      <header className="userlist-card-header">
        <div className="userlist-title-row">
          <div className="userlist-title-group">
            <div className="userlist-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c1.8-3.3 4.5-5 7.5-5s5.7 1.7 7.5 5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="userlist-search-shell">
          <input
            className="userlist-search"
            type="search"
            placeholder="Search users..."
            aria-label="Search users"
          />
        </div>
      </header>

      <div className="userlist-items">
        {users.length === 0 ? (
          <div className="userlist-empty">
            <p>No users found — pull from API returned empty.</p>
          </div>
        ) : (
          users.map((user) => (
            <article
              key={user.id}
              className={`userlist-item ${selectedUserId === user.id ? 'selected' : ''}`}
              onClick={() => onSelectUser(user.id)}
              role="button"
              tabIndex={0}
            >
              <div className="userlist-avatar-shell">
                <img src={userIcon} alt="User icon" className="userlist-avatar" />
              </div>
              <div className="userlist-info">
                <div className="userlist-name-row">
                  <span className="userlist-name">{user.name}</span>
                </div>
                <p className="userlist-email">{user.email}</p>
              </div>
              <div className="userlist-card-meta">
                <span className={`userlist-role-tag ${user.role === 'Admin' ? 'role-admin' : 'role-staff'}`}>
                  {user.role}
                </span>
                <span className={`userlist-branch-tag ${user.branch === 'Warehouse A' ? 'branch-a' : 'branch-b'}`}>
                  {user.branch}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <footer className="userlist-footer">
        <button type="button" className="userlist-button" onClick={onCreateNewUser}>
          Create new user
        </button>
        <div className="userlist-status" aria-live="polite">
          {loading ? 'Loading users...' : '\u00A0'}
        </div>
      </footer>
    </section>
  );
}

export default UserList;
