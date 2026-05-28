import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowRight, Check, ChevronLeft, Pizza, ShoppingCart, Sparkles } from 'lucide-react';
import customPizzaService from '../features/customPizza/customPizzaService';
import { addCustomPizzaToCart } from '../features/cart/cartSlice';

const steps = [
  { key: 'base', title: 'Choose your base', type: 'single', required: true, group: 'bases' },
  { key: 'sauce', title: 'Pick a sauce', type: 'single', required: true, group: 'sauces' },
  { key: 'cheese', title: 'Select cheese', type: 'single', required: true, group: 'cheeses' },
  { key: 'veggies', title: 'Layer veggies', type: 'multiple', required: false, group: 'veggies' },
  { key: 'extras', title: 'Finish with extras', type: 'multiple', required: false, group: 'extras' },
];

const emptyOptions = {
  bases: [],
  sauces: [],
  cheeses: [],
  veggies: [],
  extras: [],
};

const initialSelections = {
  base: '',
  sauce: '',
  cheese: '',
  veggies: [],
  extras: [],
};

const Builder = () => {
  const [options, setOptions] = useState(emptyOptions);
  const [selections, setSelections] = useState(initialSelections);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalQuantity } = useSelector((state) => state.cart);

  useEffect(() => {
    let isMounted = true;

    customPizzaService.getBuilderOptions()
      .then((data) => {
        if (isMounted) {
          setOptions(data);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(error.response?.data?.message || 'Builder options could not be loaded');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const price = useMemo(() => {
    const selectedSingle = [
      options.bases.find((item) => item.id === selections.base),
      options.sauces.find((item) => item.id === selections.sauce),
      options.cheeses.find((item) => item.id === selections.cheese),
    ].filter(Boolean);

    const selectedVeggies = options.veggies.filter((item) => selections.veggies.includes(item.id));
    const selectedExtras = options.extras.filter((item) => selections.extras.includes(item.id));

    return [...selectedSingle, ...selectedVeggies, ...selectedExtras].reduce((sum, item) => sum + item.price, 0);
  }, [options, selections]);

  const activeConfig = steps[activeStep];
  const activeOptions = options[activeConfig.group] || [];
  const canContinue = !activeConfig.required || Boolean(selections[activeConfig.key]);

  const findOptionName = (group, id) => options[group].find((item) => item.id === id)?.name;

  const selectSingle = (key, value) => {
    setSelections((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleMultiple = (key, value) => {
    setSelections((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const goNext = () => {
    if (!canContinue) {
      toast.error('Please complete this required step');
      return;
    }

    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const addToCart = async () => {
    if (!selections.base || !selections.sauce || !selections.cheese) {
      toast.error('Base, sauce, and cheese are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const customPizza = await customPizzaService.createCustomPizza(selections);
      dispatch(addCustomPizzaToCart(customPizza));
      toast.success('Custom pizza added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create custom pizza');
    } finally {
      setIsSubmitting(false);
    }
  };

  const summaryItems = [
    { label: 'Base', value: findOptionName('bases', selections.base) },
    { label: 'Sauce', value: findOptionName('sauces', selections.sauce) },
    { label: 'Cheese', value: findOptionName('cheeses', selections.cheese) },
    {
      label: 'Veggies',
      value: selections.veggies.map((id) => findOptionName('veggies', id)).filter(Boolean).join(', '),
    },
    {
      label: 'Extras',
      value: selections.extras.map((id) => findOptionName('extras', id)).filter(Boolean).join(', '),
    },
  ];

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
          <Link to="/cart" className="nav-link">Cart ({totalQuantity})</Link>
        </div>
      </nav>

      <main className="builder-page">
        <section className="builder-hero glass-panel">
          <span className="section-kicker">
            <Sparkles size={15} />
            Custom pizza builder
          </span>
          <h1>Build a pizza that knows your exact mood.</h1>
          <p>Choose from exactly five bases, exactly five sauces, premium cheese, veggies, and optional extras with live pricing.</p>
        </section>

        <section className="builder-shell">
          <div className="builder-workspace glass-panel">
            <div className="builder-steps">
              {steps.map((step, index) => (
                <button
                  type="button"
                  className={`builder-step ${activeStep === index ? 'active' : ''} ${index < activeStep ? 'done' : ''}`}
                  key={step.key}
                  onClick={() => setActiveStep(index)}
                >
                  <span>{index + 1}</span>
                  {step.title}
                </button>
              ))}
            </div>

            {loadError && <div className="menu-alert">{loadError}</div>}

            <div className="builder-panel">
              <div className="builder-panel-header">
                <div>
                  <span>Step {activeStep + 1} of {steps.length}</span>
                  <h2>{activeConfig.title}</h2>
                </div>
                {activeConfig.required && <strong>Required</strong>}
              </div>

              {isLoading ? (
                <div className="builder-options-grid">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span className="builder-option skeleton-choice" key={index} />
                  ))}
                </div>
              ) : (
                <div className="builder-options-grid">
                  {activeOptions.map((option) => {
                    const isSelected = activeConfig.type === 'single'
                      ? selections[activeConfig.key] === option.id
                      : selections[activeConfig.key].includes(option.id);

                    return (
                      <button
                        className={`builder-option ${isSelected ? 'selected' : ''}`}
                        type="button"
                        key={option.id}
                        onClick={() => (
                          activeConfig.type === 'single'
                            ? selectSingle(activeConfig.key, option.id)
                            : toggleMultiple(activeConfig.key, option.id)
                        )}
                      >
                        <span className="option-check">
                          {isSelected && <Check size={16} />}
                        </span>
                        <strong>{option.name}</strong>
                        <small>+ Rs {option.price}</small>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="builder-actions">
              <button
                className="icon-text-button"
                type="button"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}
              >
                <ChevronLeft size={17} />
                Back
              </button>
              {activeStep < steps.length - 1 ? (
                <button className="btn btn-primary" type="button" onClick={goNext}>
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button className="btn btn-primary" type="button" onClick={addToCart} disabled={isSubmitting || isLoading}>
                  <ShoppingCart size={18} />
                  {isSubmitting ? 'Adding...' : 'Add Custom Pizza'}
                </button>
              )}
            </div>
          </div>

          <aside className="builder-summary glass-panel">
            <span className="summary-badge">Live total</span>
            <strong className="summary-price">Rs {price}</strong>
            <div className="summary-list">
              {summaryItems.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value || 'Not selected'}</strong>
                </div>
              ))}
            </div>
            <p>Backend validation recalculates this price before the pizza is saved.</p>
          </aside>
        </section>
      </main>
    </>
  );
};

export default Builder;
