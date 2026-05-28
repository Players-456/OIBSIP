import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Clock3, PackageCheck, Pizza, ReceiptText } from 'lucide-react';
import { fetchMyOrders } from '../features/orders/orderSlice';

const statusSteps = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark">
            <Pizza size={24} />
          </span>
          <span>PizzaDelivery</span>
        </Link>
        <div className="navbar-nav">
          <Link to="/menu" className="nav-link">Menu</Link>
          <Link to="/cart" className="nav-link">Cart</Link>
        </div>
      </nav>

      <main className="orders-page">
        <section className="orders-header glass-panel">
          <span className="section-kicker">
            <ReceiptText size={15} />
            Order history
          </span>
          <h1>Track every pizza run.</h1>
          <p>Only your logged-in account can see these orders.</p>
        </section>

        {isError && <div className="menu-alert">{message}</div>}

        {isLoading ? (
          <section className="orders-list">
            {Array.from({ length: 3 }, (_, index) => (
              <article className="order-card glass-panel order-skeleton" key={index}>
                <span className="skeleton-line wide" />
                <span className="skeleton-line" />
                <span className="skeleton-line short" />
              </article>
            ))}
          </section>
        ) : orders.length === 0 ? (
          <section className="empty-state glass-panel">
            <PackageCheck size={46} />
            <h2>No orders yet</h2>
            <p>Your paid pizza adventures will appear here.</p>
            <Link to="/menu" className="btn btn-primary">Start Ordering</Link>
          </section>
        ) : (
          <section className="orders-list">
            {orders.map((order) => {
              const currentStep = statusSteps.indexOf(order.orderStatus);
              return (
                <article className="order-card glass-panel" key={order._id}>
                  <div className="order-card-head">
                    <div>
                      <span className="cart-type">Order</span>
                      <h2>{order._id}</h2>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="order-badges">
                      <span className={`status-badge payment-${order.paymentStatus}`}>{order.paymentStatus}</span>
                      <span className={`status-badge order-${order.orderStatus}`}>{order.orderStatus.replaceAll('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item) => (
                      <span key={`${order._id}-${item.itemId}`}>
                        {item.name} x {item.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="order-timeline">
                    {statusSteps.map((step, index) => (
                      <div className={index <= currentStep ? 'active' : ''} key={step}>
                        <Clock3 size={14} />
                        <span>{step.replaceAll('_', ' ')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-total-row">
                    <span>Total paid</span>
                    <strong>Rs {order.totalAmount}</strong>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
};

export default MyOrders;
