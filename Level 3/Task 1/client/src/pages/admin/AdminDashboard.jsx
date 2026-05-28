import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  Pizza,
  ShoppingBag,
  Users,
} from 'lucide-react';
import AdminShell from './AdminShell';
import { fetchAnalytics } from '../../features/admin/adminSlice';

const metricIcons = {
  totalUsers: Users,
  totalOrders: ShoppingBag,
  totalRevenue: IndianRupee,
  lowStockCount: AlertTriangle,
  totalPizzas: Pizza,
  customPizzaOrders: Boxes,
};

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const {
    analytics = {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      lowStockCount: 0,
      totalPizzas: 0,
      customPizzaOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      recentOrders: [],
    },
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const cards = [
    ['totalUsers', 'Total Users', analytics?.totalUsers || 0],
    ['totalOrders', 'Total Orders', analytics?.totalOrders || 0],
    ['totalRevenue', 'Revenue', `Rs ${analytics?.totalRevenue || 0}`],
    ['lowStockCount', 'Low Stock Alerts', analytics?.lowStockCount || 0],
    ['totalPizzas', 'Total Pizzas', analytics?.totalPizzas || 0],
    [
      'customPizzaOrders',
      'Custom Pizza Orders',
      analytics?.customPizzaOrders || 0,
    ],
  ];

  return (
    <AdminShell>
      <section className="admin-hero glass-panel">
        <span className="section-kicker">Admin Command Center</span>
        <h1>Operations at a glance.</h1>
        <p>
          Track revenue, stock pressure, users, and order movement without
          leaving the dashboard.
        </p>
      </section>

      {isError && (
        <section className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>Error loading analytics</h3>
          <p>{message || 'Something went wrong.'}</p>
        </section>
      )}

      {isLoading ? (
        <section className="admin-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="admin-card skeleton-choice" key={index} />
          ))}
        </section>
      ) : (
        <>
          <section className="admin-grid">
            {cards.map(([key, label, value]) => {
              const Icon = metricIcons[key];

              return (
                <article className="admin-card glass-panel" key={key}>
                  <Icon size={24} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              );
            })}
          </section>

          <section className="admin-panels">
            <article className="admin-panel glass-panel">
              <h2>Order Stats</h2>

              <div className="mini-chart">
                <span
                  style={{
                    height: `${Math.max(
                      analytics?.pendingOrders || 0,
                      1
                    ) * 18}px`,
                  }}
                >
                  Pending
                </span>

                <span
                  style={{
                    height: `${Math.max(
                      analytics?.deliveredOrders || 0,
                      1
                    ) * 18}px`,
                  }}
                >
                  Delivered
                </span>

                <span
                  style={{
                    height: `${Math.max(
                      analytics?.cancelledOrders || 0,
                      1
                    ) * 18}px`,
                  }}
                >
                  Cancelled
                </span>
              </div>
            </article>

            <article className="admin-panel glass-panel">
              <h2>Recent Orders</h2>

              <div className="admin-list">
                {analytics?.recentOrders?.length > 0 ? (
                  analytics.recentOrders.map((order) => (
                    <div key={order._id}>
                      <span>{order.user?.name || 'Customer'}</span>
                      <strong>Rs {order.totalAmount || 0}</strong>
                      <small>
                        {order.orderStatus
                          ? order.orderStatus.replaceAll('_', ' ')
                          : 'Unknown'}
                      </small>
                    </div>
                  ))
                ) : (
                  <p>No recent orders found.</p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </AdminShell>
  );
};

export default AdminDashboard;