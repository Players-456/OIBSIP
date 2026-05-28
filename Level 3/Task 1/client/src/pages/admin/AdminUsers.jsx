import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminShell from './AdminShell';
import { changeUserRole, fetchAdminUsers, removeUser } from '../../features/admin/adminSlice';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAdminUsers(search));
  }, [dispatch, search]);

  const toggleRole = async (user) => {
    await dispatch(changeUserRole({ userId: user._id, role: user.role === 'admin' ? 'user' : 'admin' })).unwrap();
    toast.success('User role updated');
  };

  const deleteUser = async (user) => {
    if (window.confirm(`Delete ${user.name}?`)) {
      await dispatch(removeUser(user._id)).unwrap();
      toast.success('User deleted');
    }
  };

  return (
    <AdminShell>
      <section className="admin-hero glass-panel">
        <span className="section-kicker">User management</span>
        <h1>Control staff access and customers.</h1>
      </section>

      <section className="admin-toolbar glass-panel">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" />
      </section>

      <section className="admin-table glass-panel">
        {isLoading ? <div className="menu-state">Loading users...</div> : users.map((user) => (
          <article className="admin-row" key={user._id}>
            <div><strong>{user.name}</strong><span>{user.email}</span></div>
            <span className={`status-badge ${user.role === 'admin' ? 'payment-paid' : 'payment-pending'}`}>{user.role}</span>
            <span>{user.isVerified ? 'Verified' : 'Unverified'}</span>
            <button className="icon-text-button" type="button" onClick={() => toggleRole(user)} disabled={user._id === currentUser?._id}>
              {user.role === 'admin' ? 'Demote' : 'Promote'}
            </button>
            <button className="icon-text-button danger" type="button" onClick={() => deleteUser(user)} disabled={user._id === currentUser?._id}>Delete</button>
          </article>
        ))}
      </section>
    </AdminShell>
  );
};

export default AdminUsers;
