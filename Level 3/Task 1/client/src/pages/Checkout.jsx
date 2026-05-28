import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { CreditCard, MapPin, Pizza, ShieldCheck } from 'lucide-react';
import { clearCart } from '../features/cart/cartSlice';
import {
  createOrder,
  createPaymentOrder,
  markPaymentFailed,
  verifyPayment,
} from '../features/orders/orderSlice';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const initialAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

const Checkout = () => {
  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isPaying } = useSelector((state) => state.orders);

  const totals = useMemo(() => {
    const subtotal = totalAmount;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
    const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    return { subtotal, tax, deliveryFee, grandTotal };
  }, [totalAmount]);

  const onAddressChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const missingField = requiredFields.find((field) => !shippingAddress[field].trim());

    if (missingField) {
      toast.error('Please complete your delivery address');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handlePaymentFailure = async (orderId, reason) => {
    if (orderId) {
      await dispatch(markPaymentFailed(orderId));
    }
    navigate('/payment-failed', { state: { orderId, reason } });
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validateAddress()) {
      return;
    }

    let order;

    try {
      order = await dispatch(createOrder({
        items: items.map((item) => ({
          type: item.type,
          itemId: item.itemId,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress,
      })).unwrap();

      const paymentData = await dispatch(createPaymentOrder(order._id)).unwrap();
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error('Payment gateway could not be loaded');
      }

      const razorpay = new window.Razorpay({
        key: paymentData.keyId,
        amount: paymentData.razorpayOrder.amount,
        currency: paymentData.razorpayOrder.currency,
        name: 'PizzaDelivery',
        description: `Order ${order._id}`,
        order_id: paymentData.razorpayOrder.id,
        prefill: {
          name: shippingAddress.fullName,
          email: user.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#FF5E3A',
        },
        handler: async (response) => {
          try {
            const verifiedOrder = await dispatch(verifyPayment({
              orderId: order._id,
              paymentData: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            })).unwrap();
            dispatch(clearCart());
            toast.success('Payment successful');
            navigate('/payment-success', { state: { order: verifiedOrder } });
          } catch (error) {
            toast.error(error || 'Payment verification failed');
            handlePaymentFailure(order._id, error);
          }
        },
        modal: {
          ondismiss: () => {
            handlePaymentFailure(order._id, 'Payment popup was closed');
          },
        },
      });

      razorpay.on('payment.failed', (response) => {
        handlePaymentFailure(order._id, response.error?.description || 'Payment failed');
      });

      razorpay.open();
    } catch (error) {
      const message = typeof error === 'string' ? error : error.message || 'Checkout failed';
      toast.error(message);
      if (order?._id) {
        await handlePaymentFailure(order._id, message);
      }
    }
  };

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
          <Link to="/cart" className="nav-link">Cart ({totalQuantity})</Link>
          <Link to="/orders" className="nav-link">My Orders</Link>
        </div>
      </nav>

      <main className="checkout-page">
        <section className="checkout-header glass-panel">
          <span className="section-kicker">
            <ShieldCheck size={15} />
            Secure checkout
          </span>
          <h1>Delivery details and payment.</h1>
          <p>Confirm your address, review totals, and pay safely with Razorpay.</p>
        </section>

        <section className="checkout-shell">
          <form className="checkout-form glass-panel">
            <div className="checkout-section-title">
              <MapPin size={20} />
              <h2>Shipping address</h2>
            </div>

            <div className="checkout-grid">
              <input name="fullName" value={shippingAddress.fullName} onChange={onAddressChange} placeholder="Full name" />
              <input name="phone" value={shippingAddress.phone} onChange={onAddressChange} placeholder="Phone number" />
              <input className="wide" name="addressLine1" value={shippingAddress.addressLine1} onChange={onAddressChange} placeholder="Address line 1" />
              <input className="wide" name="addressLine2" value={shippingAddress.addressLine2} onChange={onAddressChange} placeholder="Address line 2 optional" />
              <input name="city" value={shippingAddress.city} onChange={onAddressChange} placeholder="City" />
              <input name="state" value={shippingAddress.state} onChange={onAddressChange} placeholder="State" />
              <input name="pincode" value={shippingAddress.pincode} onChange={onAddressChange} placeholder="Pincode" />
            </div>
          </form>

          <aside className="checkout-summary glass-panel">
            <div className="checkout-section-title">
              <CreditCard size={20} />
              <h2>Order summary</h2>
            </div>

            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.cartId}>
                  <span>{item.name} x {item.quantity}</span>
                  <strong>Rs {item.price * item.quantity}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div><span>Subtotal</span><strong>Rs {totals.subtotal}</strong></div>
              <div><span>Tax</span><strong>Rs {totals.tax}</strong></div>
              <div><span>Delivery</span><strong>{totals.deliveryFee === 0 ? 'Free' : `Rs ${totals.deliveryFee}`}</strong></div>
              <div className="grand-total"><span>Total</span><strong>Rs {totals.grandTotal}</strong></div>
            </div>

            <button className="btn btn-primary" type="button" disabled={items.length === 0 || isLoading || isPaying} onClick={placeOrder}>
              {isLoading || isPaying ? 'Processing...' : 'Place Order & Pay'}
            </button>
            {items.length === 0 && <p className="checkout-note">Add items to cart before checkout.</p>}
          </aside>
        </section>
      </main>
    </>
  );
};

export default Checkout;
