import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Clock3, Filter, Pizza, Search, ShoppingCart, SlidersHorizontal, Sparkles, Star, XCircle } from 'lucide-react';
import { fetchPizzas, resetPizzaFilters, setPizzaFilters } from '../features/pizzas/pizzaSlice';
import { addPizzaToCart } from '../features/cart/cartSlice';

const skeletonCards = Array.from({ length: 6 }, (_, index) => index);

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pizzas, count, filters, isLoading, isError, message } = useSelector((state) => state.pizzas);
  const { user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchPizzas(filters));
  }, [dispatch, filters]);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    dispatch(setPizzaFilters({ [name]: value }));
  };

  const onAddPizza = (pizza) => {
    if (!user) {
      toast.error('Please login to continue ordering');
      navigate('/login');
      return;
    }

    dispatch(addPizzaToCart(pizza));
    toast.success(`${pizza.name} added to cart`);
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
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/builder" className="nav-link">Builder</Link>
          {user?.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
          <Link to="/cart" className="nav-link">
            <ShoppingCart size={16} />
            Cart ({totalQuantity})
          </Link>
          {user ? (
            <span className="nav-greeting">Hello, {user.name}</span>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </nav>

      <main className="menu-page">
        <section className="menu-header glass-panel">
          <div>
            <p className="section-kicker">
              <Sparkles size={15} />
              Fresh from the oven
            </p>
            <h1>Pizza Menu</h1>
            <p className="menu-lede">Search the kitchen, filter your cravings, and choose a pizza that arrives hot.</p>
          </div>
          <div className="menu-count">
            <SlidersHorizontal size={18} />
            <span>{count} pizzas</span>
          </div>
        </section>

        <section className="menu-toolbar" aria-label="Pizza filters">
          <label className="search-field">
            <Search size={18} />
            <input
              type="search"
              name="search"
              value={filters.search}
              onChange={onFilterChange}
              placeholder="Search pizzas, ingredients, tags"
            />
          </label>

          <label className="filter-field">
            <Filter size={16} />
            <select name="category" value={filters.category} onChange={onFilterChange}>
              <option value="all">All categories</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Min</span>
            <input
              type="number"
              min="0"
              name="minPrice"
              value={filters.minPrice}
              onChange={onFilterChange}
              placeholder="Rs 0"
            />
          </label>

          <label className="filter-field">
            <span>Max</span>
            <input
              type="number"
              min="0"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={onFilterChange}
              placeholder="Rs 600"
            />
          </label>

          <label className="filter-field">
            <span>Sort</span>
            <select name="sort" value={filters.sort} onChange={onFilterChange}>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </label>

          <button className="icon-text-button" type="button" onClick={() => dispatch(resetPizzaFilters())}>
            Reset
          </button>
        </section>

        {isError && (
          <div className="menu-alert">
            <XCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {isLoading ? (
          <section className="pizza-grid" aria-label="Loading pizzas">
            {skeletonCards.map((item) => (
              <article className="pizza-card pizza-card-skeleton" key={item}>
                <div className="skeleton-media" />
                <div className="pizza-card-body">
                  <span className="skeleton-line wide" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line short" />
                  <div className="skeleton-footer">
                    <span className="skeleton-line price" />
                    <span className="skeleton-button" />
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : pizzas.length === 0 ? (
          <div className="menu-state empty-state glass-panel">
            <Pizza size={42} />
            <h2>No pizzas found</h2>
            <p>No pizzas match these filters. Clear them and try a wider craving.</p>
            <button className="icon-text-button" type="button" onClick={() => dispatch(resetPizzaFilters())}>
              Reset filters
            </button>
          </div>
        ) : (
          <section className="pizza-grid">
            {pizzas.map((pizza) => (
              <article className="pizza-card" key={pizza._id}>
                <div className="pizza-image-wrap">
                  <img src={pizza.image} alt={pizza.name} className="pizza-image" />
                  <span className={`availability-pill ${pizza.isAvailable ? 'available' : 'unavailable'}`}>
                    {pizza.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="prep-pill">
                    <Clock3 size={14} />
                    {pizza.prepTime} min
                  </span>
                </div>
                <div className="pizza-card-body">
                  <div className="pizza-title-row">
                    <h2>{pizza.name}</h2>
                    <span className="rating-badge">
                      <Star size={15} fill="currentColor" />
                      {pizza.rating}
                    </span>
                  </div>
                  <p>{pizza.description}</p>
                  <div className="pizza-tags">
                    <span>{pizza.category}</span>
                    {pizza.tags?.slice(0, 2).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="pizza-card-footer">
                    <strong>From Rs {pizza.startingPrice}</strong>
                    <button className="btn" type="button" disabled={!pizza.isAvailable} onClick={() => onAddPizza(pizza)}>
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default Menu;
