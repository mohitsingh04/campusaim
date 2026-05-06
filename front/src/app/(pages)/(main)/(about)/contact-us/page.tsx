import WhatsAppSection from "./_contact-us-components/WhatsAppSection";
import EmailAndMobileSection from "./_contact-us-components/EmailAndMobileSection";
import { Metadata } from "next";

const title = "Contact Us";
const keywords = ["Contact Campusaim", "Contact us Campusaim"];
const description =
  "Contact Campusaim for education guidance, course information, college inquiries, school details, coaching institutes, and student support assistance.";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "contact Campusaim",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: title,
    description: description,
    url: "/contact-us",
    siteName: "Campusaim",
    images: featuredImage,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: featuredImage,
  },
};

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-(--primary-bg) text-(--text-color) pb-20">
      <div className="pt-12 sm:px-8 px-4">
        <header className="pb-16">
          <h1 className="text-4xl sm:text-5xl md:text-7xl max-w-3xl text-(--text-color-emphasis)">
            Contact <span className="text-gradient">Campusaim</span>
          </h1>
          <div className="mt-6 mb-10 w-84 h-0.5 bg-linear-to-r from-(--main) to-transparent" />
          <p className="leading-relaxed max-w-2xl text-(--text-color)! text-lg">
            Contact Campusaim for education guidance, course information,
            college inquiries, school details, coaching institutes, and student
            support assistance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <WhatsAppSection />
          </div>
          <div className="md:col-span-2">
            <EmailAndMobileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
