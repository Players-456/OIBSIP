import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminShell from './AdminShell';
import { changeInventoryStock, fetchAdminInventory } from '../../features/admin/adminSlice';

const AdminInventory = () => {
  const [filters, setFilters] = useState({ search: '', lowStock: 'all' });
  const [draftStock, setDraftStock] = useState({});
  const dispatch = useDispatch();
  const { inventory, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminInventory(filters));
  }, [dispatch, filters]);

  const saveStock = async (item) => {
    await dispatch(changeInventoryStock({ itemId: item._id, quantity: Number(draftStock[item._id] ?? item.quantity) })).unwrap();
    toast.success('Stock updated');
  };

  return (
    <AdminShell>
      <section className="admin-hero glass-panel">
        <span className="section-kicker">Inventory control</span>
        <h1>Watch stock before it becomes a problem.</h1>
      </section>

      <section className="admin-toolbar glass-panel">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search inventory" />
        <select value={filters.lowStock} onChange={(e) => setFilters({ ...filters, lowStock: e.target.value })}>
          <option value="all">All stock</option>
          <option value="true">Low stock only</option>
        </select>
      </section>

      <section className="admin-table glass-panel">
        {isLoading ? <div className="menu-state">Loading inventory...</div> : inventory.map((item) => (
          <article className={`admin-row ${item.isLowStock ? 'low-stock-row' : ''}`} key={item._id}>
            <div><strong>{item.name}</strong><span>{item.unit}</span></div>
            <span className={`status-badge ${item.isActive ? 'payment-paid' : 'payment-failed'}`}>{item.isActive ? 'active' : 'unavailable'}</span>
            <span>Threshold {item.lowStockThreshold}</span>
            <input type="number" min="0" value={draftStock[item._id] ?? item.quantity} onChange={(e) => setDraftStock({ ...draftStock, [item._id]: e.target.value })} />
            <button className="icon-text-button" type="button" onClick={() => saveStock(item)}>Save stock</button>
          </article>
        ))}
      </section>
    </AdminShell>
  );
};

export default AdminInventory;
