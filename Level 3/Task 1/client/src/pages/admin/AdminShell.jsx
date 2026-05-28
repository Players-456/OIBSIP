import { Link, NavLink } from 'react-router-dom';
import { Pizza } from 'lucide-react';

const AdminShell = ({ children }) => (
  <>
    <nav className="navbar admin-navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-mark">
          <Pizza size={24} />
        </span>
        <span>PizzaDelivery Admin</span>
      </Link>
      <div className="navbar-nav">
        <NavLink to="/admin" end className="nav-link">Dashboard</NavLink>
        <NavLink to="/admin/orders" className="nav-link">Orders</NavLink>
        <NavLink to="/admin/pizzas" className="nav-link">Pizzas</NavLink>
        <NavLink to="/admin/inventory" className="nav-link">Inventory</NavLink>
        <NavLink to="/admin/users" className="nav-link">Users</NavLink>
      </div>
    </nav>
    <main className="admin-page">{children}</main>
  </>
);

export default AdminShell;
