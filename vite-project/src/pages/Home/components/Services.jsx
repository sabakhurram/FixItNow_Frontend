import { useRef, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sun,
  Wrench,
  ClipboardCheck,
  BatteryCharging,
  ArrowUpRight,
} from 'lucide-react';
import './Services.css';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: '01',
    name: 'Solar Installation',
    label: 'SOLAR INSTALLATION',
    title: 'Power your world with the sun.',
    desc: 'Custom-designed solar systems for homes and businesses. Generate your own clean energy and take control of your electricity costs.',
    icon: <Sun size={24} />,
    image: 'https://images.pexels.com/photos/9875405/pexels-photo-9875405.jpeg',
    alt: 'Solar panels installed on a modern rooftop',
  },
  {
    number: '02',
    name: 'Solar Maintenance',
    label: 'SOLAR MAINTENANCE',
    title: 'Keep your energy performing.',
    desc: 'Protect your solar investment with professional inspections, cleaning and ongoing maintenance designed to keep your system efficient.',
    icon: <Wrench size={24} />,
    image: 'https://images.pexels.com/photos/11645013/pexels-photo-11645013.jpeg',
    alt: 'Solar panels in bright natural sunlight',
  },
  {
    number: '03',
    name: 'Solar Consultation',
    label: 'SOLAR CONSULTATION',
    title: 'The right energy starts here.',
    desc: 'Understand your energy requirements and get expert guidance to find a solar solution designed around your property and future goals.',
    icon: <ClipboardCheck size={24} />,
    image: 'https://images.pexels.com/photos/4254157/pexels-photo-4254157.jpeg',
    alt: 'Renewable energy infrastructure',
  },
  {
    number: '04',
    name: 'Battery Storage',
    label: 'BATTERY STORAGE',
    title: 'Power that never switches off.',
    desc: 'Store your surplus solar energy and use it day or night. Smart battery systems keep your home running through outages and help cut peak-hour costs.',
    icon: <BatteryCharging size={24} />,
    image: 'https://images.pexels.com/photos/4254161/pexels-photo-4254161.jpeg',
    alt: 'Home battery storage system',
  },
];

const EASE = 'power2.inOut';
const GROW_OPEN = 2;       // width weight of the focused card
const GROW_CLOSED = 1;     // width weight of the other cards
const HEIGHT_CLOSED = '70%';
const IMG_ZOOM = 1.25;

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};
// The redesigned section is light for every card
const themeFor = () => 'light';

const Services = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const timelineRef = useRef(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(Boolean);
    if (!section || cards.length !== services.length) return;

    const total = cards.length;
    const mm = gsap.matchMedia();

    // ── DESKTOP: pinned, scroll-scrubbed focus changes ──
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const parts = cards.map((card) => ({
        card,
        media: card.querySelector('.services__card-media'),
        img: card.querySelector('.services__card-media img, .services__card-placeholder'),
        details: card.querySelector('.services__card-details'),
        collapsed: card.querySelector('.services__card-collapsed'),
      }));
      let tl = null;
      let lastActive = -1;

      // Lets the CSS size the text column to match the focused card's width
      section.style.setProperty(
        '--open-share',
        String(GROW_OPEN / (GROW_OPEN + (total - 1) * GROW_CLOSED))
      );

      // Starting state: first card focused, the rest collapsed
      parts.forEach((p, i) => {
        const open = i === 0;
        gsap.set(p.card, { flexGrow: open ? GROW_OPEN : GROW_CLOSED, height: open ? '100%' : HEIGHT_CLOSED });
        gsap.set(p.media, { flexGrow: open ? 1 : 0 }); // image fills the space the text doesn't need
        gsap.set(p.img, { scale: open ? 1 : IMG_ZOOM });
        gsap.set(p.details, { opacity: open ? 1 : 0, y: open ? 0 : 24 });
        gsap.set(p.collapsed, { opacity: open ? 0 : 1 });
      });

      const sync = () => {
        if (!tl) return;
        const current = Math.min(total - 1, Math.max(0, Math.round(tl.time())));
        if (current === lastActive) return;
        lastActive = current;
        cards.forEach((card, i) => card.classList.toggle('is-active', i === current));
        setActive(current);
        setTheme(themeFor(current));
      };

      tl = gsap.timeline({
        scrollTrigger: {
          id: 'services-pin',
          trigger: section,
          start: 'top top',
          end: () => `+=${(total - 1) * window.innerHeight * 1.2}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 'labels',            // always rest on a focused service
            duration: { min: 0.25, max: 0.7 },
            delay: 0.12,
            ease: 'power2.inOut',
          },
          onEnter: sync,
          onEnterBack: sync,
          onLeaveBack: () => setTheme('dark'), // back to the hero
        },
        onUpdate: sync,
      });
      timelineRef.current = tl;

      tl.addLabel('service-0', 0);

      // One unit of timeline time per focus change
      for (let i = 1; i < total; i++) {
        const at = i - 1;
        const from = parts[i - 1];
        const to = parts[i];

        tl
          // Previous card shrinks back into a slim card
          .to(from.card, { flexGrow: GROW_CLOSED, height: HEIGHT_CLOSED, duration: 1, ease: EASE }, at)
          .to(from.media, { flexGrow: 0, duration: 1, ease: EASE }, at)
          .to(from.img, { scale: IMG_ZOOM, duration: 1, ease: EASE }, at)
          .to(from.details, { opacity: 0, y: -16, duration: 0.35, ease: 'power1.in' }, at)
          .to(from.collapsed, { opacity: 1, duration: 0.4, ease: 'power1.out' }, at + 0.55)
          // Next card grows to the focus size and its image appears
          .to(to.card, { flexGrow: GROW_OPEN, height: '100%', duration: 1, ease: EASE }, at)
          .to(to.collapsed, { opacity: 0, duration: 0.3, ease: 'power1.in' }, at)
          .to(to.media, { flexGrow: 1, duration: 1, ease: EASE }, at)
          .to(to.img, { scale: 1, duration: 1.2, ease: 'power2.out' }, at)
          .fromTo(
            to.details,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            at + 0.4
          )
          .addLabel(`service-${i}`, at + 1);
      }

      return () => {
        section.style.removeProperty('--open-share');
        timelineRef.current = null;
      };
    });

    // ── TABLET / MOBILE / REDUCED MOTION: stacked layout, no pin ──
    mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
      cards.forEach((card, i) => {
        card.classList.add('is-active');
        ScrollTrigger.create({
          trigger: card,
          start: 'top 60%',
          end: 'bottom 60%',
          onToggle: (self) => self.isActive && setTheme(themeFor(i)),
        });
      });
    });

    return () => {
      mm.revert();
      timelineRef.current = null;
    };
  }, []);

  const handleStepClick = (index) => {
    const tl = timelineRef.current;
    const st = tl?.scrollTrigger;

    if (!tl || !st) {
      cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const progress = tl.labels[`service-${index}`] / tl.duration();
    window.scrollTo({
      top: st.start + progress * (st.end - st.start),
      behavior: 'smooth',
    });
  };

  // Clicking a slim card brings it into focus (links keep their normal behaviour)
  const handleCardClick = (event, index) => {
    if (!timelineRef.current || event.target.closest('a')) return;
    if (index !== active) handleStepClick(index);
  };

  return (
    <section id="services" className="services" data-theme="light" ref={sectionRef}>
      <div className="services__stage">
        {/* Heading */}
        <div className="services__header">
          <div className="services__header-main">
            <span className="services__brand-label">
              <span className="services__brand-dot" />
              OUR EXPERTISE
            </span>
            <h2 className="services__title">
              Powering a <span>brighter future.</span>
            </h2>
          </div>

          <div className="services__header-aside">
            <p>
              From the first consultation to long-term battery storage, we design,
              install and look after solar systems built around your property.
            </p>
            <a href="#contact" className="services__header-btn">
              Get in touch
            </a>
          </div>
        </div>

        {/* Cards: one is focused, the rest stay slim */}
        <div className="services__cards">
          {services.map((service, index) => (
            <article
              key={service.number}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`services__card ${index === 0 ? 'is-active' : ''}`}
              onClick={(e) => handleCardClick(e, index)}
            >
              {/* Slim state: big faded number + name */}
              <div className="services__card-collapsed" aria-hidden="true">
                <span className="services__card-number">{service.number}.</span>
                <div className="services__card-name">
                  <span className="services__card-mini-icon">{service.icon}</span>
                  <span>{service.name}</span>
                </div>
              </div>

              {/* Focused state: image */}
              <div className="services__card-media">
                {service.image ? (
                  <img src={service.image} alt={service.alt} loading="eager" />
                ) : (
                  <div className="services__card-placeholder" role="img" aria-label={service.alt}>
                    {service.icon}
                  </div>
                )}
                <div className="services__card-shade" />
              </div>

              {/* Focused state: details */}
              <div className="services__card-details">
                <div className="services__card-top">
                  <div className="services__card-icon">{service.icon}</div>
                  <span className="services__card-label">{service.label}</span>
                </div>

                <div className="services__card-copy">
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                </div>

                <Link to="/signin" className="services__card-link">
                  Explore service
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Slide navigation + scroll hint */}
        <div className="services__footer">
          <div className="services__scroll-hint">
            <span>SCROLL TO EXPLORE</span>
            <span className="services__scroll-line" />
          </div>

          <div className="services__nav">
            {services.map((item, i) => (
              <button
                type="button"
                key={item.number}
                onClick={() => handleStepClick(i)}
                className={`services__nav-dot ${active === i ? 'is-current' : ''}`}
                aria-label={`Go to ${item.label}`}
                aria-current={active === i ? 'step' : undefined}
              >
                <span>{item.number}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;