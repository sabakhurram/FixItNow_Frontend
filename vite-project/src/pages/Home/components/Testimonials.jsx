import { useEffect, useMemo, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { getSiteReviews } from '../../../api/reviewApi';
import './Testimonials.css';

const EASE = [0.16, 1, 0.3, 1];
const MAX_STARS = 5;
/* The strip repeats cards until it is wider than any screen */
const MIN_CARDS = 6;

/* Shown until your backend reviews load (or if there are none) */
const defaultTestimonials = [
  {
    quote:
      'FixItNow transformed our energy bills completely. Within 3 months, we were saving over 80% on electricity. The installation was seamless.',
    name: 'Ahmed Khan',
    city: 'Lahore',
    stars: 5,
  },
  {
    quote:
      "Best investment we've ever made for our home. The team was punctual, clean, and explained everything perfectly from day one.",
    name: 'Sarah Malik',
    city: 'Islamabad',
    stars: 5,
  },
  {
    quote:
      'From consultation to installation, FixItNow exceeded every expectation. Their monitoring app keeps us informed around the clock.',
    name: 'Bilal Hussain',
    city: 'Karachi',
    stars: 5,
  },
];

function Stars({ rating }) {
  const filled = Math.min(MAX_STARS, Math.max(0, Math.round(Number(rating) || MAX_STARS)));

  return (
    <span
      className="client-reviews__stars"
      role="img"
      aria-label={`${filled} out of ${MAX_STARS} stars`}
    >
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={i < filled ? 'client-reviews__star is-on' : 'client-reviews__star'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  const { quote, name, city, stars } = review;
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <article className="client-reviews__card">
      <div className="client-reviews__top">
        <Stars rating={stars} />
        <Quote className="client-reviews__mark" strokeWidth={1.8} aria-hidden="true" />
      </div>

      <p className="client-reviews__quote">{quote}</p>

      <footer className="client-reviews__author">
        <span className="client-reviews__avatar" aria-hidden="true">
          {initial}
        </span>
        <span>
          <span className="client-reviews__name">{name}</span>
          {city && <span className="client-reviews__city">{city}</span>}
        </span>
      </footer>
    </article>
  );
}

function Testimonials() {
  const [list, setList] = useState(defaultTestimonials);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const fetched = await getSiteReviews();
        if (fetched && fetched.length > 0) {
          const mapped = fetched.map(r => ({
            quote: r.comment,
            name: r.author_name,
            city: r.author_email ? r.author_email.split('@')[0] : 'Verified Client',
            stars: r.rating || 5
          }));
          setList(mapped);
        }
      } catch (err) {
        console.error("Error loading site reviews:", err);
      }
    };
    loadReviews();
  }, []);

  /* Repeat the list so the strip is long enough; repeats are hidden from
     screen readers so each review is announced once. */
  const items = useMemo(() => {
    const total = Math.max(MIN_CARDS, list.length);
    return Array.from({ length: total }, (_, i) => ({
      review: list[i % list.length],
      isRepeat: i >= list.length,
    }));
  }, [list]);

  const duration = Math.max(40, items.length * 7);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="testimonials"
        className="client-reviews"
        data-theme="light"
        aria-labelledby="testimonials-title"
      >
        <motion.header
          className="client-reviews__header"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div>
            <h2 id="testimonials-title" className="client-reviews__heading">
              What Our Clients Say
            </h2>
            <p className="client-reviews__intro">
              Real feedback from the homeowners we have worked with.
            </p>
          </div>

        </motion.header>

        <motion.div
          className="client-reviews__marquee"
          style={{ '--marquee-duration': `${duration}s` }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          <div className="client-reviews__track">
            <ul className="client-reviews__group" aria-label="Client reviews">
              {items.map(({ review, isRepeat }, i) => (
                <li
                  key={i}
                  className="client-reviews__item"
                  aria-hidden={isRepeat ? 'true' : undefined}
                >
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>

            {/* Identical copy that makes the loop seamless */}
            <ul className="client-reviews__group" aria-hidden="true">
              {items.map(({ review }, i) => (
                <li key={i} className="client-reviews__item">
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

export default Testimonials;