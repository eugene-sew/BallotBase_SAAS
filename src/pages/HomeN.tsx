import React from "react";
import {
  Shield,
  BarChart,
  Users,
  Clock,
  Globe,
  PieChart,
  Check,
  ArrowRight,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const HomeN = () => {
  // Simulated auth state - in real app would come from context/props
  const isLoggedIn = false;
  const { user } = useAuth();

  const [formStatus, setFormStatus] = React.useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("sending");
    // Simulate form submission
    setTimeout(() => setFormStatus("sent"), 1000);
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Enterprise-Grade Security",
      description:
        "End-to-end encryption, OTP authentication, and comprehensive audit trails ensure vote integrity.",
    },
    {
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
      title: "Real-time Analytics",
      description:
        "Monitor participation rates and results with interactive dashboards and exportable reports.",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Voter Management",
      description:
        "Easily import and manage voter lists, send automated notifications, and track participation.",
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Quick Setup",
      description:
        "Launch your election in minutes with our intuitive setup wizard and customizable templates.",
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Global Accessibility",
      description:
        "Multi-language support and mobile-responsive design for voters anywhere in the world.",
    },
    {
      icon: <PieChart className="w-6 h-6 text-blue-600" />,
      title: "Advanced Reports",
      description:
        "Generate detailed analytics and insights with our comprehensive reporting tools.",
    },
  ];

  const plans = [
    {
      name: "Basic",
      price: "49",
      billing: "month",
      description: "Perfect for small organizations and single events",
      features: [
        "Up to 500 voters per election",
        "Basic email support",
        "Real-time results",
        "Standard security features",
        "Basic analytics",
        "1 admin account",
      ],
    },
    {
      name: "Premium",
      price: "199",
      billing: "month",
      description: "Ideal for large organizations and multiple elections",
      features: [
        "Unlimited voters",
        "Priority 24/7 support",
        "Advanced analytics & reporting",
        "Custom branding",
        "API access",
        "Multiple admin accounts",
        "Voter verification API",
        "Custom integration support",
      ],
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-blue-600">Ballot</span>Base
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The trusted platform for secure digital voting and election
            management. Used by organizations worldwide to run transparent,
            efficient elections.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-block px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-12 text-sm text-gray-500">
            Trusted by 1000+ organizations including universities, associations,
            and corporations
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for successful elections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Choose the plan that's right for your organization
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl ${
                  plan.highlighted
                    ? "bg-white shadow-xl border-2 border-blue-600"
                    : "bg-white shadow-sm"
                }`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.billing}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center">
                      <Check className="w-5 h-5 text-blue-600 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions about BallotBase? Our team is here to help. Reach
                out to us and we'll respond as soon as possible.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-gray-600">support@ballotbase.online</p>
                    <p className="text-sm text-gray-500 mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mon-Fri from 9am to 6pm GMT
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Live Chat</h3>
                    <p className="text-gray-600">Available for Premium users</p>
                    <p className="text-sm text-gray-500 mt-1">
                      24/7 support for premium plans
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
              <form
                onSubmit={handleSubmit}
                className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                  {formStatus === "sending"
                    ? "Sending..."
                    : formStatus === "sent"
                    ? "Message Sent!"
                    : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to modernize your voting process?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of organizations that trust BallotBase for their
            electoral needs.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeN;
