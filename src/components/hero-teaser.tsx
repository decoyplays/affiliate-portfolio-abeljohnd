import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type TeaserScene = {
  video: string;
  poster: string;
  product: string;
  kicker: string;
  line: string;
  accent: string;
};

const scenes: TeaserScene[] = [
  {
    video: 'videos/computer-review.mp4',
    poster: 'images/computer.jpg',
    product: 'ACASIS HB10Pro',
    kicker: 'A desk problem, made visible.',
    line: 'Start with the hinge point.',
    accent: 'rgba(91, 115, 255, 0.94)',
  },
  {
    video: 'videos/ssd-review.mp4',
    poster: 'images/ssd.jpg',
    product: 'T-FORCE Vulcan Z',
    kicker: 'Texture carries the proof.',
    line: 'Let the object do the talking.',
    accent: 'rgba(227, 107, 73, 0.95)',
  },
  {
    video: 'videos/keyboard-review.mp4',
    poster: 'images/keyboard.jpg',
    product: 'Zeus Koon',
    kicker: 'Pace is part of the product.',
    line: 'Cut on the detail.',
    accent: 'rgba(238, 175, 62, 0.95)',
  },
  {
    video: 'videos/type-c-connector.mp4',
    poster: 'images/type-c-connector.jpg',
    product: 'Dual Type-C',
    kicker: 'The small answer matters.',
    line: 'Make the choice simpler.',
    accent: 'rgba(35, 157, 133, 0.95)',
  },
];

const sceneDurations = [4700, 3600, 3400, 3900];

function assetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

export function HeroTeaser() {
  const [activeScene, setActiveScene] = useState(0);
  const [mediaUnavailable, setMediaUnavailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scene = scenes[activeScene];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveScene((current) => (current + 1) % scenes.length);
    }, sceneDurations[activeScene]);

    return () => window.clearTimeout(timer);
  }, [activeScene]);

  useEffect(() => {
    setMediaUnavailable(false);
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    playPromise?.catch(() => undefined);
  }, [activeScene]);

  return (
    <div className="hero-teaser" aria-label="Frame 001 product video teaser">
      <div className="teaser-noise" aria-hidden="true" />
      <motion.div
        className="teaser-color-field"
        animate={{
          backgroundColor: scene.accent,
          x: activeScene % 2 === 0 ? '8%' : '-6%',
          y: activeScene === 2 ? '7%' : '-3%',
          rotate: activeScene % 2 === 0 ? -4 : 5,
        }}
        transition={{ duration: 1.3, ease: [0.22, 0.8, 0.25, 1] }}
        aria-hidden="true"
      />

      <div className="teaser-frame">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            className="teaser-media"
            key={activeScene}
            initial={{ opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.72, ease: [0.22, 0.8, 0.25, 1] }}
          >
            {mediaUnavailable ? (
              <img
                src={assetPath(scene.poster)}
                alt={`${scene.product} product still`}
                className="teaser-media-visual"
              />
            ) : (
              <video
                ref={videoRef}
                className="teaser-media-visual"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={assetPath(scene.poster)}
                onError={() => setMediaUnavailable(true)}
                aria-label={`${scene.product} muted product teaser`}
              >
                <source src={assetPath(scene.video)} type="video/mp4" />
              </video>
            )}
            <div className="teaser-scrim" aria-hidden="true" />
            <div className="teaser-scanline" aria-hidden="true" />
          </motion.div>
        </AnimatePresence>

        <div className="teaser-topline">
          <span className="teaser-index">Frame / 001</span>
          <span className="teaser-status"><i /> Muted / autoplay</span>
        </div>

        <div className="teaser-caption">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={scene.product}
              className="teaser-caption-copy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.48, ease: [0.22, 0.8, 0.25, 1] }}
            >
              <span className="teaser-product">{scene.product}</span>
              <strong>{scene.line}</strong>
              <span className="teaser-kicker">{scene.kicker}</span>
            </motion.div>
          </AnimatePresence>
          <span className="teaser-ratio">16 : 9</span>
        </div>

        <div className="teaser-supporting-strip" aria-hidden="true">
          {scenes.map((item, index) => (
            <motion.div
              className={`teaser-thumb ${index === activeScene ? 'is-active' : ''}`}
              key={item.product}
              animate={{
                opacity: index === activeScene ? 1 : 0.52,
                y: index === activeScene ? -5 : 0,
                scale: index === activeScene ? 1.04 : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <img src={assetPath(item.poster)} alt="" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="teaser-side-note">
        <span>Product video with a point of view.</span>
        <span>Not a spec-sheet readout.</span>
      </div>
      <p className="sr-only" aria-live="polite">
        {mediaUnavailable
          ? 'Video preview unavailable. Showing a product still instead.'
          : `${scene.product}: ${scene.line} ${scene.kicker}`}
      </p>
    </div>
  );
}