import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Building2, Paintbrush, Hammer, FolderKanban, Drill, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Building2,
    title: "Interior Fit-Out",
    description: "Complete interior construction and finishing services for commercial and residential projects.",
    features: ["Commercial Fit-Outs", "Residential Finishing", "Partition Systems"],
  },
  {
    icon: Paintbrush,
    title: "Design & Build",
    description: "Comprehensive turnkey solutions from initial concept through to project completion.",
    features: ["Concept Development", "Space Planning", "Construction Management"],
  },
  {
    icon: Hammer,
    title: "Renovation & Remodeling",
    description: "Transform existing spaces with our expert renovation services.",
    features: ["Space Transformation", "Structural Upgrades", "System Modernization"],
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Expert project coordination ensuring on-time, on-budget delivery.",
    features: ["Timeline Management", "Budget Control", "Quality Assurance"],
  },
  {
    icon: Drill,
    title: "Joinery Solutions",
    description: "Custom woodwork and joinery crafted to perfection.",
    features: ["Custom Furniture", "Built-in Cabinetry", "Kitchen Solutions"],
  },
  {
    icon: Settings,
    title: "MEP Coordination",
    description: "Mechanical, electrical, and plumbing integration services.",
    features: ["HVAC Integration", "Electrical Planning", "Smart Building Tech"],
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-24 md:py-32 bg-background">
      <div className="container-custom">
        <SectionHeader
          label="Our Services"
          title="Comprehensive Interior Solutions"
          description="From concept to completion, we deliver end-to-end services tailored to your unique requirements."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 border border-border hover:border-secondary transition-all duration-300 bg-card"
            >
              <service.icon className="w-10 h-10 text-secondary mb-6" strokeWidth={1.5} />
              <h3 className="heading-card text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="inline-flex items-center text-sm font-medium text-secondary group-hover:text-foreground transition-colors"
              >
                Inquire Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
