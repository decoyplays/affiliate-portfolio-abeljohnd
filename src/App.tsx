import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Menu, Play, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HeroTeaser } from '@/components/hero-teaser';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { projects } from '@/data/projects';
import { services, siteConfig } from '@/data/site';
import type { PortfolioFilter, Project } from '@/types/project';

const queryClient = new QueryClient();

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span className="image-fallback" role="img" aria-label={`${alt} image unavailable`}>
        <span>Video preview</span>
        <small>Click to watch</small>
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setMissing(true)}
    />
  );
}

function VideoModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [missing, setMissing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="video-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="video-modal-header">
          <div>
            <span className="eyebrow">Proof of work / {project.category}</span>
            <h2 id="video-modal-title" className="sr-only">{project.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            aria-label="Close video player"
            data-testid="button-close-video"
            onClick={onClose}
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>
        {missing ? (
          <div className="video-fallback" role="status">
            This local video is unavailable right now. The project card is still available to review.
          </div>
        ) : (
          <video
            className="video-frame"
            controls
            playsInline
            preload="metadata"
            poster={project.thumbnail}
            onError={() => setMissing(true)}
            aria-label={`${project.title} video`}
          >
            <source src={project.video} type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        )}
      </section>
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project, trigger: HTMLButtonElement) => void;
}) {
  return (
    <article className="project-card" data-reveal data-testid={`card-project-${project.id}`}>
      <button
        type="button"
        className="project-image-button"
        aria-label={`Play ${project.title} video`}
        data-testid={`button-play-${project.id}`}
        onClick={(event) => onOpen(project, event.currentTarget)}
      >
        <ImageWithFallback src={project.thumbnail} alt={`${project.title} project thumbnail`} />
        <span className="play-badge" aria-hidden="true"><Play size={17} fill="currentColor" /></span>
      </button>
      <div className="project-meta">
        <div>
          <span className="eyebrow">{project.category}</span>
          <h3>{project.title}</h3>
        </div>
        <p>{project.description}</p>
      </div>
    </article>
  );
}

function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<PortfolioFilter>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.title = 'Creator Studio — TikTok & Shopee product video';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        'content',
        'A proof-of-work portfolio for a TikTok and Shopee affiliate video creator. Watch local product review work in an accessible player.',
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'A proof-of-work portfolio for a TikTok and Shopee affiliate video creator.';
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeProject) {
          setActiveProject(null);
          lastTrigger.current?.focus();
        } else if (menuOpen) {
          setMenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, menuOpen]);

  useEffect(() => {
    if (!activeProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  const openProject = (project: Project, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setActiveProject(project);
  };

  const closeProject = () => {
    setActiveProject(null);
    window.setTimeout(() => lastTrigger.current?.focus(), 0);
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const visibleProjects = projects.filter(
    (project) => filter === 'All' || project.filters.includes(filter),
  );

  return (
    <div className="site-shell">
      <header className="site-nav">
        <div className="nav-inner">
          <a className="brand-mark" href="#top" data-testid="link-brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-icon">C</span>
            <span className="brand-name">Creator / studio</span>
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#top" data-testid="link-home">Home</a>
            <a href="#work" data-testid="link-work">Selected work</a>
            <a href="#about" data-testid="link-about">About</a>
            <a href="#services" data-testid="link-services">Services</a>
            <a href="#contact" data-testid="link-contact">Contact</a>
          </nav>
          <button
            type="button"
            className="menu-button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            data-testid="button-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <a href="#top" data-testid="mobile-link-home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#work" data-testid="mobile-link-work" onClick={() => setMenuOpen(false)}>Selected work</a>
            <a href="#about" data-testid="mobile-link-about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#services" data-testid="mobile-link-services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#contact" data-testid="mobile-link-contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero section-inner" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-copy" data-reveal>
              <div className="hero-kicker eyebrow">Affiliate video / product stories</div>
              <h1 id="hero-title">Make the scroll <em>stop.</em></h1>
              <p className="hero-intro">
                Short-form product videos for TikTok and Shopee that make the useful details impossible to miss.
                Built for the moment someone goes from “maybe” to “add to cart.”
              </p>
              <div className="hero-actions">
                <button type="button" className="button-primary" data-testid="button-see-work" onClick={() => scrollTo('work')}>
                  See the work <ArrowDownRight size={16} />
                </button>
                <button type="button" className="button-quiet" data-testid="button-start-brief" onClick={() => scrollTo('contact')}>
                  Start a brief <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="hero-note"><span aria-hidden="true" /> Available for selected product briefs</div>
            </div>
            <div className="hero-art" data-reveal>
              <HeroTeaser />
            </div>
          </div>
        </section>

        <div className="marquee" aria-label="Services">
          <div className="marquee-track">
            {['Product demos', 'Affiliate edits', 'Buying guides', 'Tactile reviews', 'Product demos', 'Affiliate edits', 'Buying guides', 'Tactile reviews'].map((item, index) => (
              <span className="marquee-item" key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <section id="work" className="section section-inner" aria-labelledby="work-title">
          <div className="section-header" data-reveal>
            <div>
              <span className="eyebrow">01 / The proof</span>
              <h2 id="work-title">A small reel with a lot to notice.</h2>
            </div>
            <p>Watch the actual work. Every frame here is designed to answer a useful question before the viewer has to ask it.</p>
          </div>
          <div className="work-tools" data-reveal>
            <div className="filter-list" role="group" aria-label="Filter projects">
              {(['All', 'TikTok Affiliate', 'Shopee Affiliate', 'Tech Products', 'Computer', 'Accessories'] as PortfolioFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`filter-button ${filter === option ? 'active' : ''}`}
                  aria-pressed={filter === option}
                  data-testid={`button-filter-${option.toLowerCase().replaceAll(' ', '-')}`}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="project-count" data-testid="text-project-count">{visibleProjects.length} pieces / local video files</span>
          </div>
          {visibleProjects.length > 0 ? (
            <div className="project-grid">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={openProject} />
              ))}
            </div>
          ) : (
            <div className="empty-filter" role="status">
              No videos found in this category yet.
            </div>
          )}
        </section>

        <section id="about" className="section section-dark" aria-labelledby="approach-title">
          <div className="section-inner manifesto">
            <div data-reveal>
              <span className="eyebrow">02 / The point of view</span>
              <h2 id="approach-title">Useful can still feel <span>electric.</span></h2>
            </div>
            <div className="manifesto-copy" data-reveal>
              <p>
                The job is not to make a product look expensive. It is to make the right person recognize
                themselves using it. I build short-form stories around the detail that earns attention: the click,
                the texture, the before-and-after, the tiny relief of finding the right tool.
              </p>
              <div className="principles">
                <div className="principle">
                  <span>01 / Hook</span>
                  <strong>Start with tension.</strong>
                  <p>The question or friction comes first. Context can catch up.</p>
                </div>
                <div className="principle">
                  <span>02 / Proof</span>
                  <strong>Show, do not decorate.</strong>
                  <p>Close-ups and demonstrations carry more weight than claims.</p>
                </div>
                <div className="principle">
                  <span>03 / Pace</span>
                  <strong>Cut with intent.</strong>
                  <p>Every transition earns its place, especially on a small screen.</p>
                </div>
                <div className="principle">
                  <span>04 / Action</span>
                  <strong>Leave a next step.</strong>
                  <p>A good review makes the decision feel simpler, not louder.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section process-section" aria-labelledby="process-title">
          <div className="section-inner">
            <div className="section-header" data-reveal>
              <div>
                <span className="eyebrow">03 / The process</span>
                <h2 id="process-title">From product on desk to proof in feed.</h2>
              </div>
              <p>A focused workflow keeps the creative sharp and the message easy to approve.</p>
            </div>
            <div className="process-grid">
              <article className="process-card" data-reveal>
                <div className="process-number"><span>01</span><span>Find the angle</span></div>
                <h3>One product.<br />One reason.</h3>
                <p>We identify the use case that gives the video a reason to exist.</p>
              </article>
              <article className="process-card" data-reveal>
                <div className="process-number"><span>02</span><span>Make it visible</span></div>
                <h3>Details become<br />the story.</h3>
                <p>Hands-on footage, clean framing, and a cut that respects the viewer.</p>
              </article>
              <article className="process-card" data-reveal>
                <div className="process-number"><span>03</span><span>Ready to post</span></div>
                <h3>Clear enough<br />to act.</h3>
                <p>A final edit built for the pace and behavior of its platform.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="services" className="section services-section" aria-labelledby="services-title">
          <div className="section-inner">
            <div className="section-header" data-reveal>
              <div>
                <span className="eyebrow">03 / The toolkit</span>
                <h2 id="services-title">Built for the small screen.</h2>
              </div>
              <p>From first hook to final caption, each service is shaped around making the product easier to understand.</p>
            </div>
            <div className="services-grid">
              {services.map((service) => (
                <article className="service-card" data-reveal key={service.title}>
                  <span className="eyebrow">{service.eyebrow}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section section-inner" aria-labelledby="contact-title">
          <div className="contact-inner">
            <div data-reveal>
              <span className="eyebrow">04 / Next frame</span>
              <h2 id="contact-title">Have a product that deserves a <em>closer look?</em></h2>
              <p className="contact-copy">Send the product, the platform, and the one thing your audience needs to understand. We can take it from there.</p>
            </div>
            <aside className="contact-card" data-reveal>
              <span className="eyebrow">Contact placeholder</span>
              <p>Personal contact details are intentionally reserved for the creator to add before publishing this portfolio.</p>
              <a className="contact-email" href={siteConfig.socialLinks.email} data-testid="link-email-placeholder">
                {siteConfig.email}
              </a>
              <span className="contact-handle">{siteConfig.handle}</span>
              <a className="button-primary" href="#top" data-testid="link-contact-placeholder">
                Back to the top <ArrowUpRight size={16} />
              </a>
            </aside>
          </div>
          <footer className="footer">
            <p>{siteConfig.name} — TikTok + Shopee affiliate video</p>
            <div className="footer-links" aria-label="Social links">
              <a href={siteConfig.socialLinks.tiktok} target="_blank" rel="noreferrer" aria-label={`TikTok ${siteConfig.handle}`}>
                TikTok / {siteConfig.handle}
              </a>
              <a href={siteConfig.socialLinks.shopee} target="_blank" rel="noreferrer" aria-label="SwiunFix Tech Hub shop">
                Shop / SwiUnFix Tech Hub
              </a>
              <a href={siteConfig.socialLinks.email} aria-label={`Email ${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </div>
            <p>© {new Date().getFullYear()} / {siteConfig.handle}</p>
          </footer>
        </section>
      </main>

      {activeProject && <VideoModal project={activeProject} onClose={closeProject} />}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={PortfolioPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;