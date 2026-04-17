import { motion } from "framer-motion";

const variants = {
  initial:  { opacity: 0, y: 18 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -12 },
};

const transition = {
  duration: 0.38,
  ease: [0.4, 0, 0.2, 1], // easeInOut cubic
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
