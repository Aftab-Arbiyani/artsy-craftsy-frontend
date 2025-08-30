"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required."),
  phone: z.string().min(1, "Phone number is required."),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(1, "Subject is required."),
  message: z.string().min(1, "Message is required."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "" },
  });

  const onSubmit: SubmitHandler<ContactFormValues> = (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Contact form submitted:", data);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you shortly.",
        variant: "success",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-12">
        Contact Us
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column */}
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4">Onart Quest Limited</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-2 flex items-center">
                  <span className="w-1 h-6 bg-primary mr-3"></span>
                  Regd. Office
                </h3>
                <p className="text-muted-foreground">
                  No 123, Sterling Rd, Nungambakkam,
                  <br />
                  Chennai, Tamil Nadu 600034
                </p>
              </div>
              <div className="flex-1">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.992033623588!2d80.2398378153629!3d13.067495090772216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52666b3f7f7f7f%3A0x3f7f7f7f7f7f7f7f!2sSterling%20Rd%2C%20Nungambakkam%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1620986798539!5m2!1sen!2sin"
                  width="100%"
                  height="150"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  className="rounded-lg shadow-md"
                  title="Office Location"
                ></iframe>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Our Services</h2>
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="w-1 h-6 bg-primary mr-3"></span>
                    <h3 className="font-semibold text-primary">
                      Seller Support
                    </h3>
                  </div>
                  <Separator className="w-16 my-2" />
                  <a
                    href="mailto:partners@mojarto.com"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 break-all"
                  >
                    <Mail className="h-4 w-4 shrink-0" /> partners@mojarto.com
                  </a>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="w-1 h-6 bg-primary mr-3"></span>
                    <h3 className="font-semibold text-primary">
                      Customer Support
                    </h3>
                  </div>
                  <Separator className="w-16 my-2" />
                  <a
                    href="mailto:contactus@mojarto.com"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 break-all"
                  >
                    <Mail className="h-4 w-4 shrink-0" /> contactus@mojarto.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center">
              <span className="w-1 h-6 bg-primary mr-3"></span>
              Data Privacy Grievance
            </h3>
            <p className="text-sm text-muted-foreground">
              Email id: poornima@mojarto.com <br />
              Address: No 123, Sterling Rd, Nungambakkam, Chennai, Tamil Nadu
              600034
            </p>
          </section>
        </div>

        {/* Right Column */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Get in touch</h2>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Your Name"
                                {...field}
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="phone"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="tel"
                                placeholder="Your Phone"
                                {...field}
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="Your Email"
                                {...field}
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="subject"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Subject"
                                {...field}
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="message"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Your message..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
