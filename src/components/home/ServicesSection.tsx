import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Building2, Paintbrush, Hammer, FolderKanban, Drill, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api, Service } from "@/lib/api";
import { useDataCache } from "@/hooks/useDataCache";

const iconMap = {
  Building2,
  Paintbrush,
  Hammer,
  FolderKanban,
  Drill,
  Settings,
};

export const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCachedServices } = useDataCache();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getCachedServices();
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [getCachedServices]);
  return (
    <section id="services" className="py-24 md:py-32 bg-background">
      <div className="container-custom">
        <SectionHeader
          label="Our Services"
          title="Comprehensive Interior Solutions"
          description="From concept to completion, we deliver end-to-end services tailored to your unique requirements."
        />

        {loading ? (
          <div className="text-center py-12">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="p-8 border border-border hover:border-secondary transition-colors duration-300 h-full">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                      {IconComponent && <IconComponent className="w-8 h-8 text-secondary" />}
                    </div>
                    <h3 className="font-serif text-xl text-foreground mb-4 group-hover:text-secondary transition-colors duration-300">{service.title}</h3>
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1 h-1 bg-secondary rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/contact"
                      className="inline-flex items-center text-secondary hover:text-secondary/80 transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
