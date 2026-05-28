import { Link, useLocation } from 'react-router-dom';
import { Pizza, XCircle } from 'lucide-react';

const PaymentFailed = () => {
  const { state } = useLocation();

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
        <section className="payment-result-card failed glass-panel">
          <XCircle size={72} />
          <h1>Payment failed</h1>
          <p>{state?.reason || 'The payment could not be completed. Your cart is still safe.'}</p>
          {state?.orderId && (
            <div className="payment-result-summary">
              <span>Order ID</span>
              <strong>{state.orderId}</strong>
            </div>
          )}
          <div className="payment-result-actions">
            <Link to="/checkout" className="btn btn-primary">Retry Payment</Link>
            <Link to="/cart" className="btn btn-secondary">Return to Cart</Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default PaymentFailed;
