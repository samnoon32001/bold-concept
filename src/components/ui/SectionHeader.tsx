import { motion } from "framer-motion";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export const SectionHeader = ({
  label,
  title,
  description,
  align = "center",
  light = false,
}: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} mb-12 md:mb-16`}
    >
      {label && (
        <span className={`text-label ${light ? "text-secondary" : "text-secondary"} block mb-4`}>
          {label}
        </span>
      )}
      <h2 className={`heading-section ${light ? "text-primary-foreground" : "text-foreground"}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-body mt-6 ${light ? "text-primary-foreground/70" : ""}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
};
