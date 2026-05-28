import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Pizza, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from '../features/cart/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart);

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
          <Link to="/builder" className="nav-link">Builder</Link>
          <Link to="/orders" className="nav-link">My Orders</Link>
        </div>
      </nav>

      <main className="cart-page">
        <section className="cart-header glass-panel">
          <span className="section-kicker">
            <ShoppingBag size={15} />
            Your cart
          </span>
          <h1>Review your pizza stack.</h1>
          <p>{totalQuantity} item{totalQuantity === 1 ? '' : 's'} ready for the next phase.</p>
        </section>

        {items.length === 0 ? (
          <section className="empty-state glass-panel">
            <Pizza size={46} />
            <h2>Your cart is empty</h2>
            <p>Add a signature pizza or build your own custom masterpiece.</p>
            <div className="cart-empty-actions">
              <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
              <Link to="/builder" className="btn btn-secondary">Build Custom</Link>
            </div>
          </section>
        ) : (
          <section className="cart-shell">
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item glass-panel" key={item.cartId}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-main">
                    <span className="cart-type">{item.type === 'custom' ? 'Custom pizza' : 'Menu pizza'}</span>
                    <h2>{item.name}</h2>
                    <p>{item.details}</p>
                    {item.type === 'custom' && item.selections && (
                      <small>
                        {item.selections.base.name}, {item.selections.sauce.name}, {item.selections.cheese.name}
                      </small>
                    )}
                  </div>
                  <div className="cart-quantity">
                    <button type="button" onClick={() => dispatch(decreaseQuantity(item.cartId))} aria-label="Decrease quantity">
                      <Minus size={16} />
                    </button>
                    <strong>{item.quantity}</strong>
                    <button type="button" onClick={() => dispatch(increaseQuantity(item.cartId))} aria-label="Increase quantity">
                      <Plus size={16} />
                    </button>
                  </div>
                  <strong className="cart-line-total">Rs {item.price * item.quantity}</strong>
                  <button className="remove-cart-item" type="button" onClick={() => dispatch(removeFromCart(item.cartId))} aria-label="Remove item">
                    <X size={18} />
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-summary glass-panel">
              <h2>Cart total</h2>
              <div>
                <span>Items</span>
                <strong>{totalQuantity}</strong>
              </div>
              <div>
                <span>Subtotal</span>
                <strong>Rs {totalAmount}</strong>
              </div>
              <Link className="btn btn-primary" to="/checkout">Checkout</Link>
              <button className="icon-text-button clear-cart-button" type="button" onClick={() => dispatch(clearCart())}>
                <Trash2 size={17} />
                Clear cart
              </button>
            </aside>
          </section>
        )}
      </main>
    </>
  );
};

export default Cart;
