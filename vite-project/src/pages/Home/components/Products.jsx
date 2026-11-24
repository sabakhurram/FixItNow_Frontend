import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sun } from 'lucide-react';
import useProducts from '../../../hooks/useProducts';
import useSectionTheme from "../../../hooks/useSectionThemes";
import './Products.css';

const ALL = 'All';
const MAX_VISIBLE = 6;
const EASE = [0.16, 1, 0.3, 1];

const formatPrice = (value) => `Rs. ${Number(value).toLocaleString('en-US')}`;

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (col) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: col * 0.08, ease: EASE },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

/* ---------- Product card (was ProductCard.jsx) ---------- */

const ProductCard = memo(function ProductCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const inStock = Number(product.stock) > 0;

  return (
    <article className="pcard">
      <div className="pcard__media">
        {product.image && !imgFailed ? (
          <img
            className="pcard__img"
            src={product.image}
            alt=""                 /* the title link already names the product */
            width="640"
            height="480"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="pcard__placeholder" aria-hidden="true">
            <Sun size={40} />
          </div>
        )}
      </div>

      <div className="pcard__body">
        <p className="pcard__category">{product.category}</p>

        <h3 className="pcard__title">
          <Link to={`/products/${product.id}`} className="pcard__link">
            {product.name}
          </Link>
        </h3>

        {product.description && <p className="pcard__desc">{product.description}</p>}

        <div className="pcard__meta">
          <span className="pcard__price">{formatPrice(product.price)}</span>
          <span className={`pcard__stock ${inStock ? 'is-in' : 'is-out'}`}>
            {inStock ? 'Available' : 'Out of Stock'}
          </span>
        </div>

        <span className="pcard__cta" aria-hidden="true">
          View details <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
});

/* ---------- Loading placeholder (was ProductSkeleton.jsx) ---------- */

function ProductSkeleton() {
  return (
    <li className="products__item" aria-hidden="true">
      <div className="pcard pcard--skeleton">
        <div className="pcard__media skeleton" />
        <div className="pcard__body">
          <span className="skeleton skeleton--line skeleton--short" />
          <span className="skeleton skeleton--line skeleton--title" />
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--line skeleton--mid" />
          <span className="skeleton skeleton--block" />
        </div>
      </div>
    </li>
  );
}

/* ---------- Section ---------- */

function Products() {
  const sectionRef = useRef(null);
  const { products, status, error, retry } = useProducts();
  const [category, setCategory] = useState(ALL);

  useSectionTheme(sectionRef, 'light');

  // The page gets taller when the skeleton is replaced by real cards,
  // so re-measure the scroll triggers below this section.
  useEffect(() => {
    if (status === 'success') ScrollTrigger.refresh();
  }, [status]);

  const categories = useMemo(
    () => [ALL, ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const matching = useMemo(
    () => (category === ALL ? products : products.filter((p) => p.category === category)),
    [products, category]
  );
  const visible = matching.slice(0, MAX_VISIBLE);

  const viewAllTo =
    category === ALL ? '/products' : `/products?category=${encodeURIComponent(category)}`;

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="products"
        className="products"
        data-theme="light"
        ref={sectionRef}
        aria-labelledby="products-title"
      >
        <div className="products__container">
          <motion.header
            className="products__heading"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="products__eyebrow">OUR PRODUCTS</p>
            <h2 id="products-title">
              Quality Products for <span>Your Solar Needs</span>
            </h2>
            <p className="products__intro">
              Explore our range of reliable solar products designed to deliver efficient and
              dependable energy solutions.
            </p>
          </motion.header>

          {status === 'success' && categories.length > 2 && (
            <div className="products__tabs" role="group" aria-label="Filter products by category">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`products__tab ${c === category ? 'is-active' : ''}`}
                  aria-pressed={c === category}
                  onClick={() => setCategory(c)}
                >
                  {c === category && (
                    <motion.span
                      layoutId="products-tab-pill"
                      className="products__tab-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="products__tab-label">{c}</span>
                </button>
              ))}
            </div>
          )}

          {status === 'loading' && (
            <ul className="products__grid" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: MAX_VISIBLE }, (_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </ul>
          )}

          {status === 'error' && (
            <div className="products__state" role="alert">
              <p>{error}</p>
              <button type="button" className="products__btn products__btn--primary" onClick={retry}>
                Try again
              </button>
            </div>
          )}

          {status === 'success' && products.length === 0 && (
            <div className="products__state">
              <p>New products are coming soon.</p>
            </div>
          )}

          {status === 'success' && products.length > 0 && (
            <>
              <p className="products__sr" aria-live="polite">
                Showing {visible.length} of {matching.length} products
                {category !== ALL ? ` in ${category}` : ''}
              </p>

              <ul className="products__grid">
                <AnimatePresence mode="popLayout">
                  {visible.map((product, i) => (
                    <motion.li
                      key={product.id}
                      layout
                      className="products__item"
                      variants={itemVariants}
                      custom={i % 3}
                      initial="hidden"
                      whileInView="visible"
                      exit="exit"
                      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                    >
                      <ProductCard product={product} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <motion.div className="products__footer" layout="position">
                <Link to={viewAllTo} className="products__btn products__btn--secondary">
                  View all {matching.length} products <ArrowRight size={16} />
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </MotionConfig>
  );
}

export default Products;