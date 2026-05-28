import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Pizza } from 'lucide-react';

const PaymentSuccess = () => {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark">
            <Pizza size={24} />
          </span>
          <span>PizzaDelivery</span>
        </Link>
      </nav>

      <main className="payment-result-page">
        <section className="payment-result-card success glass-panel">
          <CheckCircle2 size={72} />
          <h1>Payment successful</h1>
          <p>Your order has been confirmed and the kitchen is warming up.</p>
          {order && (
            <div className="payment-result-summary">
              <span>Order ID</span>
              <strong>{order._id}</strong>
              <span>Total</span>
              <strong>Rs {order.totalAmount}</strong>
            </div>
          )}
          <div className="payment-result-actions">
            <Link to="/orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/menu" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default PaymentSuccess;
