import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { ArrowRight, Clock3, Flame, Pizza, Quote, ShieldCheck, ShoppingCart, Sparkles, Star, Truck } from 'lucide-react';

const featuredPizzas = [
  {
    name: 'Paneer Inferno',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop',
    label: 'Spicy bestseller',
    price: 'From Rs 259'
  },
  {
    name: 'Margherita Classic',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1000&auto=format&fit=crop',
    label: 'Fresh basil',
    price: 'From Rs 199'
  },
  {
    name: 'Chicken Tikka Feast',
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1000&auto=format&fit=crop',
    label: 'Smoky loaded',
    price: 'From Rs 289'
  }
];

const stats = [
  { value: '28m', label: 'average delivery', icon: Clock3 },
  { value: '4.8', label: 'customer rating', icon: Star },
  { value: '12k+', label: 'orders delivered', icon: Truck },
  { value: '100%', label: 'sealed boxes', icon: ShieldCheck }
];

const testimonials = [
  {
    quote: 'The crust is crisp, the toppings taste fresh, and delivery is always right on time.',
    name: 'Aarav M.',
    detail: 'Weekend regular'
  },
  {
    quote: 'Finally a pizza app that feels fast and premium. The Paneer Inferno is unreal.',
    name: 'Nisha K.',
    detail: 'Spice loyalist'
  },
  {
    quote: 'Hot pizza, neat packaging, and the menu makes it easy to find exactly what I want.',
    name: 'Rohan S.',
    detail: 'Late-night fan'
  }
];

const Landing = () => {
  const { user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
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
          <Link to="/menu" className="nav-link">Menu</Link>
          <Link to="/builder" className="nav-link">Builder</Link>
          {user?.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
          <Link to="/cart" className="nav-link">
            <ShoppingCart size={16} />
            Cart ({totalQuantity})
          </Link>
          {user ? (
            <>
              <span className="nav-greeting">Hello, {user.name}</span>
              <button className="nav-action secondary" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-action">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="landing-page">
        <section className="hero">
          <div className="hero-backdrop" />
          <div className="hero-content">
            <span className="hero-badge">
              <Sparkles size={16} />
              Premium oven-fired pizza
            </span>
            <h1 className="hero-title">Delicious Pizza, Delivered Fast.</h1>
            <p className="hero-subtitle">
              Hand-stretched dough, bold toppings, and sealed hot boxes delivered with the kind of polish your dinner plans deserve.
            </p>
            <div className="hero-actions">
              <Link to={user ? '/menu' : '/register'} className="btn btn-primary">
                Order Now
                <ArrowRight size={18} />
              </Link>
              <Link to="/builder" className="btn btn-secondary">Build Your Own</Link>
            </div>
          </div>

          <div className="hero-panel glass-panel">
            <img
              src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=900&auto=format&fit=crop"
              alt="Hot artisan pizza"
            />
            <div>
              <span className="panel-kicker">Chef pick</span>
              <strong>Margherita Classic</strong>
              <p>Fresh basil, molten mozzarella, bright tomato sauce.</p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <article className="stat-card glass-panel" key={item.label}>
                <Icon size={22} />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            );
          })}
        </section>

        <section className="featured-section">
          <div className="section-heading">
            <span className="section-kicker">Featured pizzas</span>
            <h2>Signature pies made for serious cravings.</h2>
          </div>
          <div className="featured-grid">
            {featuredPizzas.map((pizza) => (
              <article className="featured-card" key={pizza.name}>
                <img src={pizza.image} alt={pizza.name} />
                <div className="featured-overlay">
                  <span>
                    <Flame size={14} />
                    {pizza.label}
                  </span>
                  <h3>{pizza.name}</h3>
                  <strong>{pizza.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="testimonials-section">
          <div className="section-heading compact">
            <span className="section-kicker">Loved locally</span>
            <h2>Real reactions from hungry people.</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card glass-panel" key={testimonial.name}>
                <Quote size={24} />
                <p>{testimonial.quote}</p>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Landing;
