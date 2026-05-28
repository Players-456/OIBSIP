import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminShell from './AdminShell';
import { changeOrderStatus, fetchAdminOrders } from '../../features/admin/adminSlice';

const statuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [filters, setFilters] = useState({ search: '', paymentStatus: 'all', orderStatus: 'all' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminOrders(filters));
  }, [dispatch, filters]);

  const updateStatus = async (orderId, orderStatus) => {
    await dispatch(changeOrderStatus({ orderId, orderStatus })).unwrap();
    toast.success('Order status updated');
  };

  return (
    <AdminShell>
      <section className="admin-hero glass-panel">
        <span className="section-kicker">Order workflow</span>
        <h1>Manage every delivery stage.</h1>
      </section>

      <section className="admin-toolbar glass-panel">
        <input placeholder="Search Razorpay id" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}>
          <option value="all">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={filters.orderStatus} onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}>
          <option value="all">All statuses</option>
          {statuses.map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}
        </select>
      </section>

      <section className="admin-table glass-panel">
        {isLoading ? <div className="menu-state">Loading orders...</div> : orders.map((order) => (
          <article className="admin-row" key={order._id}>
            <div>
              <strong>{order.user?.name || 'Customer'}</strong>
              <span>{order._id}</span>
            </div>
            <span className={`status-badge payment-${order.paymentStatus}`}>{order.paymentStatus}</span>
            <strong>Rs {order.totalAmount}</strong>
            <select value={order.orderStatus} onChange={(e) => updateStatus(order._id, e.target.value)}>
              {statuses.map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}
            </select>
            <button className="icon-text-button" type="button" onClick={() => setSelectedOrder(order)}>Details</button>
          </article>
        ))}
      </section>

      {selectedOrder && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal glass-panel">
            <h2>Order details</h2>
            <p>{selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city}</p>
            {selectedOrder.items.map((item) => <div className="admin-detail-line" key={item.itemId}>{item.name} x {item.quantity}<strong>Rs {item.price}</strong></div>)}
            <button className="btn btn-primary" type="button" onClick={() => setSelectedOrder(null)}>Close</button>
          </section>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminOrders;
