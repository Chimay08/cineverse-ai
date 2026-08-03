import { motion } from "framer-motion";

// Scroll-reveal wrapper — elegant fade + rise as elements enter the viewport.
const variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  once = true,
  as: Tag = motion.div,
}) {
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

export { variants };
