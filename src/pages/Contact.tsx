import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const projectTypes = [
  "Interior Fit-Out",
  "Design & Build",
  "Renovation",
  "Project Management",
  "Joinery Solutions",
  "MEP Coordination",
  "Other",
];

const budgetRanges = [
  "Under AED 100,000",
  "AED 100,000 - 500,000",
  "AED 500,000 - 1,000,000",
  "AED 1,000,000 - 5,000,000",
  "Above AED 5,000,000",
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", data);
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    reset();
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <Layout>
      {/* Page Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-primary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-label text-secondary block mb-4">Get in Touch</span>
            <h1 className="heading-display text-primary-foreground">
              Contact Us
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="heading-card text-2xl text-foreground mb-6">
                Start Your Project
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and our team will get back to you within 24 hours 
                to discuss your project requirements.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full px-4 py-3 bg-card border border-border focus:border-secondary focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-3 bg-card border border-border focus:border-secondary focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full px-4 py-3 bg-card border border-border focus:border-secondary focus:outline-none transition-colors"
                      placeholder="+971 50 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Type *
                    </label>
                    <select
                      {...register("projectType")}
                      className="w-full px-4 py-3 bg-card border border-border focus:border-secondary focus:outline-none transition-colors"
                    >
                      <option value="">Select a service</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.projectType && (
                      <p className="text-destructive text-sm mt-1">{errors.projectType.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Budget Range
                  </label>
                  <select
                    {...register("budget")}
                    className="w-full px-4 py-3 bg-card border border-border focus:border-secondary focus:outline-none transition-colors"
                  >
                    <option value="">Select budget range (optional)</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project Details *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    className="w-full px-4 py-3 bg-card border border-border focus:border-secondary focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your project, requirements, and timeline..."
                  />
                  {errors.message && (
                    <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Message Sent
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-primary p-8 md:p-12 h-full">
                <h2 className="heading-card text-2xl text-primary-foreground mb-8">
                  Contact Information
                </h2>

                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-secondary mt-1" />
                    <div>
                      <h3 className="font-medium text-primary-foreground mb-1">Address</h3>
                      <p className="text-primary-foreground/70">
                        Business Bay, Dubai, UAE<br />
                        P.O. Box 123456
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-secondary mt-1" />
                    <div>
                      <h3 className="font-medium text-primary-foreground mb-1">Phone</h3>
                      <a 
                        href="tel:+97144567890" 
                        className="text-primary-foreground/70 hover:text-secondary transition-colors"
                      >
                        +971 4 456 7890
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-secondary mt-1" />
                    <div>
                      <h3 className="font-medium text-primary-foreground mb-1">Email</h3>
                      <a 
                        href="mailto:info@boldconcept.ae" 
                        className="text-primary-foreground/70 hover:text-secondary transition-colors"
                      >
                        info@boldconcept.ae
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-secondary mt-1" />
                    <div>
                      <h3 className="font-medium text-primary-foreground mb-1">Working Hours</h3>
                      <p className="text-primary-foreground/70">
                        Sun - Thu: 9:00 AM - 6:00 PM<br />
                        Sat: 10:00 AM - 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="aspect-video bg-primary-foreground/10 flex items-center justify-center">
                  <span className="text-primary-foreground/50 text-sm">Map Location</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
