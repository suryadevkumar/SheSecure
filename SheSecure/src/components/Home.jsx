import React, { useState } from "react";
import {
  ShieldCheck,
  MapPin,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getAllFeedbacks } from "../routes/feedback-routes";
import { submitContactForm } from "../routes/superAdmin-routes";
import logo1 from "../assets/logo.png";
import logo from "../assets/logo1.png";
import front from "../assets/Front.png";
import locationTrack from "../assets/locationTrack.png";
import sosImg from "../assets/SOS.png";
import hospital from "../assets/hospital.png";
import police from "../assets/police.png";
import guidance from "../assets/Guidance.png";
import mission from "../assets/mission.png";
import vision from "../assets/vision.png";
import { toast } from "react-toastify";

// Animation styles
const imageAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

const HomePage = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Features />
      <About />
      <OurMissionVision />
      <FeedbackCarousel />
      <Contact />
      <Footer />
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id) => {
    setIsOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="w-full h-[4rem] py-2 fixed top-0 left-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with animation */}
          <div className="flex items-center cursor-pointer">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-14 w-auto transition-transform duration-300 hover:scale-110"
              style={imageAnimation.initial}
              onLoad={(e) => {
                e.target.style.opacity = 1;
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-gray-700 font-semibold hover:text-blue-600 cursor-pointer transition-colors duration-300"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-700 font-semibold hover:text-blue-600 cursor-pointer transition-colors duration-300"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-700 font-semibold hover:text-blue-600 cursor-pointer transition-colors duration-300"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-gray-700 font-semibold hover:text-blue-600 cursor-pointer transition-colors duration-300"
            >
              Contact
            </button>
            <Link
              to="/signup"
              className="text-gray-700 font-semibold hover:text-blue-600 cursor-pointer transition-colors duration-300"
            >
              SignUp
            </Link>
            <Link
              to="/login"
              className="text-gray-700 font-semibold hover:text-blue-600 cursor-pointer transition-colors duration-300"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none transition-transform duration-300 hover:scale-110"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu (Dropdown) */}
        {isOpen && (
          <div className="md:hidden bg-white py-2 px-4 shadow-lg rounded-b-lg animate-fadeIn">
            <button
              onClick={() => handleNavClick("home")}
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick("about")}
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              Contact
            </button>
            <button
              onClick={() => handleNavClick("how")}
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              How It Works
            </button>
            <Link
              to="/signup"
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              SignUp
            </Link>
            <Link
              to="/login"
              className="block py-2 text-gray-700 hover:text-blue-600 w-full text-left transition-colors duration-300"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

const HeroSection = () => {
  return (
    <section
      id="home"
      className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-pink-300 to-white py-12 md:py-16 px-4 mt-20"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
            Your Personal Safety <br /> Companion — Anytime, Anywhere
          </h1>
          <p className="my-4 text-base md:text-lg text-gray-600">
            SheSecure empowers women with real-time alerts, tracking & emergency
            features to ensure safety wherever you go.
          </p>
          <Link
            to="/signup"
            className="mt-6 mx-auto md:mx-0 bg-pink-600 text-white px-6 py-3 rounded-2xl text-lg hover:bg-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>

        <div className="w-full md:w-1/2">
          <img
            src={front}
            alt="Safety Illustration"
            className="w-full max-w-md mx-auto transition-all duration-500 hover:scale-105"
            style={imageAnimation.initial}
            onLoad={(e) => {
              e.target.style.opacity = 1;
              e.target.style.transform = 'translateY(0)';
            }}
          />
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-pink-600 transition-transform duration-300 hover:scale-125" />,
      title: "Sign Up & Verify",
      description:
        "Create your account and get verified by our secure onboarding process.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-pink-600 transition-transform duration-300 hover:scale-125" />,
      title: "Live Tracking",
      description:
        "Enable real-time location sharing with your trusted contacts.",
    },
    {
      icon: <PhoneCall className="w-8 h-8 text-pink-600 transition-transform duration-300 hover:scale-125" />,
      title: "One-Tap SOS",
      description: "Trigger emergency alerts instantly with one simple tap.",
    },
  ];

  return (
    <section id="how" className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-6 bg-pink-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-xl font-semibold text-pink-700 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      top: "Stay Connected",
      title: "Location Sharing",
      description:
        "Share your real-time location with loved ones and decide who can track you and for how long. Whether you're commuting late at night or out for a run, this feature helps keep you safe and reassures those who care about you.",
      image: locationTrack,
    },
    {
      top: "Instant Emergency Alerts",
      title: "SOS Alert",
      description:
        "In any dangerous situation, just press the SOS button to send an instant alert to your emergency contacts and nearby authorities. The alert includes your current location and a distress message so that help can reach you as quickly as possible. Because every second matters.",
      image: sosImg,
    },
    {
      top: "Nearest Hospitals",
      title: "Nearby Hospitals",
      description:
        "Access a list of nearby hospitals and emergency rooms within seconds. Whether it's for first aid or medical emergencies, this feature helps you find the fastest route to care. Powered by real-time location services and Google Maps integration.",
      image: hospital,
    },
    {
      top: "Nearest Police Stations",
      title: "Nearby Police Stations",
      description:
        "SheSecure helps you locate the nearest police station using real-time data and your location. You can get directions instantly and even call directly from the app. In emergencies, this feature ensures that legal help is never far away.",
      image: police,
    },
    {
      top: "24/7 Guidance",
      title: "Counselor Guidance",
      description:
        "Sometimes safety means emotional support too. SheSecure connects you with verified counselors and support professionals who are here to listen, guide, and help — whether you're dealing with anxiety, fear, or trauma. Your conversations are private, secure, and judgment-free.",
      image: guidance,
    },
  ];

  return (
    <section id="features" className="bg-[#FFF4F4] py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 animate-fadeIn">
          Key Features
        </h2>

        <div className="flex flex-col gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-8 
                bg-white rounded-2xl shadow-md p-6 transition-all duration-500 
                hover:shadow-xl hover:scale-[1.01] animate-fadeInUp
                ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Image with animation */}
              <div className="md:w-1/2 rounded-2xl p-6 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="rounded-xl w-full object-cover transition-transform duration-500 hover:scale-105"
                  style={imageAnimation.initial}
                  onLoad={(e) => {
                    e.target.style.opacity = 1;
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Divider */}
              <div className="hidden md:block w-[1px] bg-gray-800 h-60 transition-all duration-300 hover:scale-y-110"></div>

              {/* Text */}
              <div className="md:w-1/2">
                <span className="bg-pink-100 rounded-full px-4 py-2 font-semibold transition-all duration-300 hover:bg-pink-200">
                  {feature.top}
                </span>
                <h3 className="mt-3 text-3xl font-semibold text-gray-800 mb-4 text-left transition-colors duration-300 hover:text-pink-600">
                  {feature.title}
                </h3>
                <p className="text-gray-800 text-md leading-relaxed text-left">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section
      id="about"
      className="relative bg-gradient-to-br from-pink-100 via-orange-100 to-red-100 py-24 px-6"
    >
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10 md:p-16 text-center transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-1">
        <h2 className="text-4xl font-extrabold text-red-500 mb-6 tracking-tight animate-fadeIn">
          About <span className="text-gray-800">SheSecure</span>
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6 animate-fadeIn">
          <strong>SheSecure</strong> is your all-in-one safety companion,
          designed especially for women. Whether you're commuting late at night,
          facing an emergency, or just want peace of mind — we're here.
          Real-time location tracking, instant SOS alerts, nearby help centers,
          and emotional support — all in one place.
        </p>
        <p className="text-md text-gray-600 max-w-3xl mx-auto animate-fadeIn delay-100">
          Our mission is simple: To use technology as a shield, a voice, and a
          helping hand — so every woman feels{" "}
          <strong>confident, safe, and heard</strong> at every step of her
          journey.
        </p>
      </div>
    </section>
  );
};

const OurMissionVision = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-black mb-6 animate-fadeIn">Our Mission</h2>
          <div className="border-t-2 border-black pt-6">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <div className="h-80 w-full flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={mission}
                    alt="Mission Illustration"
                    className="h-full w-auto object-contain mx-auto transition-transform duration-500 hover:scale-105"
                    style={imageAnimation.initial}
                    onLoad={(e) => {
                      e.target.style.opacity = 1;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <p className="text-gray-800 text-lg leading-relaxed">
                  At SheSecure, our mission is to revolutionize women's safety
                  by providing a user-friendly platform that connects women to
                  real-time safety features, emergency contacts, and support
                  services. We are committed to creating a safer environment by
                  offering instant access to SOS alerts, location sharing, and
                  emotional support, ensuring that every woman is empowered and
                  protected in any situation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div>
          <h2 className="text-4xl font-bold text-black mb-6 animate-fadeIn">Our Vision</h2>
          <div className="border-t-2 border-black pt-6">
            <div className="flex flex-col gap-0">
              {/* Text Section */}
              <div className="w-full">
                <p className="text-gray-800 text-lg leading-relaxed">
                  <span className="text-2xl font-semibold text-gray-900 leading-tight block mb-4">
                    We created SheSecure because no woman should feel unsafe.
                  </span>
                  Empowering women with the tools and resources they need to
                  feel safe, confident, and in control. We envision a world
                  where every woman, regardless of her location, has immediate
                  access to support, safety, and guidance, enabling her to
                  navigate the world with peace of mind and security.
                </p>
              </div>

              {/* Image Section */}
              <div className="w-full max-w-[120%]">
                <div className="mx-auto w-[100%] lg:w-[75%] overflow-hidden rounded-lg">
                  <img
                    src={vision}
                    alt="Vision Illustration"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    style={imageAnimation.initial}
                    onLoad={(e) => {
                      e.target.style.opacity = 1;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeedbackCarousel = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data } = await getAllFeedbacks();
        setFeedbacks(data || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (feedbacks.length === 0) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({
          left: carouselRef.current.offsetWidth / 3,
          behavior: "smooth",
        });

        // Reset when scroll reaches end
        if (
          carouselRef.current.scrollLeft + carouselRef.current.offsetWidth >=
          carouselRef.current.scrollWidth
        ) {
          setTimeout(() => {
            carouselRef.current.scrollTo({ left: 0, behavior: "instant" });
          }, 500);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [feedbacks]);

  const truncateReview = (text) => {
    const words = text.split(" ");
    return words.length > 200 ? words.slice(0, 200).join(" ") + "..." : text;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No feedbacks available yet.
      </div>
    );
  }

  return (
    <div className="relative py-8 px-4 bg-orange-100 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-black bg-clip-text text-transparent animate-fadeIn">
          What People Are Saying
        </h2>

        <div
          ref={carouselRef}
          className="flex gap-6 md:gap-10 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {feedbacks.concat(feedbacks).map((feedback, idx) => (
            <div
              key={feedback._id + idx}
              className="flex-shrink-0 w-4/5 sm:w-1/2 md:w-1/3 bg-white rounded-lg shadow-md border border-gray-200 snap-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              style={{
                minWidth: "280px",
                maxWidth: "350px",
                height: "240px",
                scrollSnapAlign: "start",
              }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        feedback.userId?.additionalDetails?.image ||
                        "https://via.placeholder.com/50"
                      }
                      alt="Profile"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div>
                      <p className="text-base sm:text-sm font-bold text-gray-900">
                        {feedback.userId?.firstName} {feedback.userId?.lastName}
                      </p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 hover:scale-125 ${
                              i < feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <img
                    src={logo1}
                    alt="SheSecure Logo"
                    className="h-6 w-auto transition-transform duration-300 hover:scale-110"
                  />
                </div>

                <div className="mb-2">
                  <p className="text-xs text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex-grow overflow-hidden">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {truncateReview(feedback.review)}
                  </p>
                </div>

                {feedback.review.split(" ").length > 200 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Review truncated to 200 words
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate email format
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitContactForm(formData);

      if (response.success) {
        toast.success("Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-[#FFF4F4] py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 animate-fadeIn">Contact Us</h2>
        <p className="text-lg text-gray-600 mb-10 animate-fadeIn">
          Got questions, feedback, or need help? Reach out to us below — we'd
          love to hear from you!
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 space-y-6 transition-all duration-300 hover:shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name*"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 hover:border-pink-300"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email*"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 hover:border-pink-300"
              required
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject*"
            value={formData.subject}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 hover:border-pink-300"
            required
          />
          <textarea
            name="message"
            placeholder="Your Message*"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 hover:border-pink-300"
            required
          ></textarea>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div className="animate-fadeIn">
          <h3 className="text-2xl font-bold text-pink-500 mb-4 transition-colors duration-300 hover:text-pink-400">SheSecure</h3>
          <p className="text-sm text-gray-400">
            Empowering women with safety, confidence and technology — every step
            of the way.
          </p>
        </div>

        {/* Quick Links */}
        <div className="animate-fadeIn">
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <button
                onClick={() => scrollToSection("how")}
                className="hover:text-pink-400 transition-colors duration-300"
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("features")}
                className="hover:text-pink-400 transition-colors duration-300"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("about")}
                className="hover:text-pink-400 transition-colors duration-300"
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contact")}
                className="hover:text-pink-400 transition-colors duration-300"
              >
                Contact
              </button>
            </li>
          </ul>
        </div>

        {/* Contact or Credits */}
        <div className="animate-fadeIn">
          <h4 className="text-lg font-semibold mb-4">Connect</h4>
          <p className="text-sm text-gray-400">
            Email: support@shesecure.app <br />
            &copy; {new Date().getFullYear()} SheSecure. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomePage;