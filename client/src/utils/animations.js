// Simple animation utilities for the landing page

export const fadeInUp = {
  initial: { opacity: 0, transform: 'translateY(20px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: 'all 0.6s ease-out'
};

export const fadeInLeft = {
  initial: { opacity: 0, transform: 'translateX(-20px)' },
  animate: { opacity: 1, transform: 'translateX(0px)' },
  transition: 'all 0.6s ease-out'
};

export const fadeInRight = {
  initial: { opacity: 0, transform: 'translateX(20px)' },
  animate: { opacity: 1, transform: 'translateX(0px)' },
  transition: 'all 0.6s ease-out'
};

export const scaleIn = {
  initial: { opacity: 0, transform: 'scale(0.9)' },
  animate: { opacity: 1, transform: 'scale(1)' },
  transition: 'all 0.6s ease-out'
};

// Hook for intersection observer
export const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView];
};

// Animated component wrapper
export const AnimatedSection = ({ children, animation = fadeInUp, delay = 0 }) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        ...animation.initial,
        ...(isInView ? animation.animate : {}),
        transition: `${animation.transition}, transition-delay: ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};
