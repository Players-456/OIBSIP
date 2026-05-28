import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminShell from './AdminShell';
import {
  createAdminPizza,
  fetchAdminPizzas,
  removeAdminPizza,
  updateAdminPizza,
} from '../../features/admin/adminSlice';

const emptyPizza = {
  name: '',
  slug: '',
  description: '',
  category: 'vegetarian',
  image: '',
  small: 199,
  medium: 299,
  large: 429,
  ingredients: '',
  tags: '',
  prepTime: 20,
  rating: 4.5,
  isAvailable: true,
};

const toForm = (pizza) => ({
  name: pizza.name,
  slug: pizza.slug,
  description: pizza.description,
  category: pizza.category,
  image: pizza.image,
  small: pizza.sizes?.find((size) => size.size === 'small')?.price || 199,
  medium: pizza.sizes?.find((size) => size.size === 'medium')?.price || 299,
  large: pizza.sizes?.find((size) => size.size === 'large')?.price || 429,
  ingredients: pizza.ingredients?.join(', ') || '',
  tags: pizza.tags?.join(', ') || '',
  prepTime: pizza.prepTime,
  rating: pizza.rating,
  isAvailable: pizza.isAvailable,
});

const toPayload = (form) => ({
  name: form.name,
  slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  description: form.description,
  category: form.category,
  image: form.image,
  sizes: [
    { size: 'small', price: Number(form.small) },
    { size: 'medium', price: Number(form.medium) },
    { size: 'large', price: Number(form.large) },
  ],
  ingredients: form.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
  tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
  prepTime: Number(form.prepTime),
  rating: Number(form.rating),
  isAvailable: form.isAvailable,
});

const AdminPizzas = () => {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyPizza);
  const [editingPizza, setEditingPizza] = useState(null);
  const dispatch = useDispatch();
  const { pizzas, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminPizzas({ search }));
  }, [dispatch, search]);

  const previewImage = useMemo(() => form.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=900&auto=format&fit=crop', [form.image]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const savePizza = async (event) => {
    event.preventDefault();
    const payload = toPayload(form);
    if (editingPizza) {
      await dispatch(updateAdminPizza({ pizzaId: editingPizza._id, pizzaData: payload })).unwrap();
      toast.success('Pizza updated');
    } else {
      await dispatch(createAdminPizza(payload)).unwrap();
      toast.success('Pizza created');
    }
    setForm(emptyPizza);
    setEditingPizza(null);
  };

  const startEdit = (pizza) => {
    setEditingPizza(pizza);
    setForm(toForm(pizza));
  };

  const deletePizza = async (pizza) => {
    if (window.confirm(`Delete ${pizza.name}?`)) {
      await dispatch(removeAdminPizza(pizza._id)).unwrap();
      toast.success('Pizza deleted');
    }
  };

  return (
    <AdminShell>
      <section className="admin-hero glass-panel">
        <span className="section-kicker">Pizza management</span>
        <h1>Create, edit, and curate the menu.</h1>
      </section>

      <section className="admin-management-grid">
        <form className="admin-form glass-panel" onSubmit={savePizza}>
          <h2>{editingPizza ? 'Edit pizza' : 'Create pizza'}</h2>
          <img src={previewImage} alt="Pizza preview" className="admin-image-preview" />
          <input name="name" value={form.name} onChange={updateField} placeholder="Name" required />
          <input name="slug" value={form.slug} onChange={updateField} placeholder="Slug optional" />
          <textarea name="description" value={form.description} onChange={updateField} placeholder="Description" required />
          <select name="category" value={form.category} onChange={updateField}>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
          <input name="image" value={form.image} onChange={updateField} placeholder="Image URL" required />
          <div className="admin-form-row">
            <input name="small" type="number" value={form.small} onChange={updateField} placeholder="Small" />
            <input name="medium" type="number" value={form.medium} onChange={updateField} placeholder="Medium" />
            <input name="large" type="number" value={form.large} onChange={updateField} placeholder="Large" />
          </div>
          <input name="ingredients" value={form.ingredients} onChange={updateField} placeholder="Ingredients comma separated" />
          <input name="tags" value={form.tags} onChange={updateField} placeholder="Tags comma separated" />
          <label className="admin-check"><input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={updateField} /> Available</label>
          <button className="btn btn-primary" type="submit">{editingPizza ? 'Save pizza' : 'Create pizza'}</button>
        </form>

        <section className="admin-table glass-panel">
          <div className="admin-toolbar inline">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pizzas" />
          </div>
          {isLoading ? <div className="menu-state">Loading pizzas...</div> : pizzas.map((pizza) => (
            <article className="admin-row pizza-admin-row" key={pizza._id}>
              <img src={pizza.image} alt={pizza.name} />
              <div><strong>{pizza.name}</strong><span>{pizza.category}</span></div>
              <span className={`status-badge ${pizza.isAvailable ? 'payment-paid' : 'payment-failed'}`}>{pizza.isAvailable ? 'available' : 'hidden'}</span>
              <button className="icon-text-button" type="button" onClick={() => startEdit(pizza)}>Edit</button>
              <button className="icon-text-button danger" type="button" onClick={() => deletePizza(pizza)}>Delete</button>
            </article>
          ))}
        </section>
      </section>
    </AdminShell>
  );
};

export default AdminPizzas;
