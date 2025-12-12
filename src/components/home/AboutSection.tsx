import { motion } from "framer-motion";
import { Target, Eye, Award, Clock, Users, Shield } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We pursue the highest standards in every detail.",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description: "Projects completed on schedule without compromising quality.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We work closely with clients for seamless execution.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Transparency and honesty guide every interaction.",
  },
];

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "50+", label: "Team Members" },
  { value: "98%", label: "Client Satisfaction" },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container-custom">
        {/* Introduction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-label text-secondary block mb-4">About Us</span>
            <h2 className="heading-section text-foreground mb-6">
              Technical Precision Meets Creative Excellence
            </h2>
            <div className="space-y-6 text-body">
              <p>
                BOLD CONCEPT Technical Service was founded on the belief that exceptional 
                interior spaces are born from the perfect union of technical expertise and 
                creative vision. Based in Dubai, we have established ourselves as leaders 
                in premium interior fit-out and renovation services.
              </p>
              <p>
                From luxurious residential interiors to sophisticated commercial spaces, 
                every project we undertake reflects our passion for excellence and our 
                commitment to transforming visions into reality.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
                alt="BOLD CONCEPT team at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 md:w-48 md:h-48 bg-secondary" />
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-24 py-16 md:py-24 px-8 md:px-16 bg-primary">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <Target className="w-12 h-12 text-secondary mb-6 mx-auto md:mx-0" />
            <h3 className="font-serif text-2xl md:text-3xl text-primary-foreground mb-4">
              Our Mission
            </h3>
            <p className="text-primary-foreground/70 leading-relaxed">
              To deliver exceptional interior fit-out and renovation services that transform 
              spaces into functional works of art, exceeding client expectations through 
              technical precision and innovative design.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center md:text-left"
          >
            <Eye className="w-12 h-12 text-secondary mb-6 mx-auto md:mx-0" />
            <h3 className="font-serif text-2xl md:text-3xl text-primary-foreground mb-4">
              Our Vision
            </h3>
            <p className="text-primary-foreground/70 leading-relaxed">
              To be the most trusted name in interior fit-out services, recognized for 
              setting industry standards in quality, innovation, and client satisfaction.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="py-16 md:py-20 bg-secondary mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <span className="block font-serif text-4xl md:text-5xl text-secondary-foreground mb-2">
                  {stat.value}
                </span>
                <span className="text-sm uppercase tracking-[0.15em] text-secondary-foreground/70">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <SectionHeader
          label="Our Values"
          title="Principles That Guide Us"
          description="These core values shape every project we undertake and every relationship we build."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 border border-border hover:border-secondary transition-colors"
            >
              <value.icon className="w-10 h-10 text-secondary mx-auto mb-6" strokeWidth={1.5} />
              <h3 className="heading-card text-foreground mb-3">{value.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
