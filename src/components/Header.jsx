"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="relative z-50">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled
            ? "bg-gray-200 border-orange-500/10"
            : "bg-gray-200 border-orange-500/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/MedinaRemoved.png"
                alt="Logo"
                width={120}
                height={40}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { name: "Home", href: "/" },
                { name: "Social Media RTM Account", href: "SocMedAcc" },
                {
                  name: "Social Media Public Statement",
                  href: "#public-statement",
                },
                { name: "AI", href: "#ai" },
                { name: "Determ", href: "#determ" },
                { name: "Contact Us", href: "#contact" },
                { name: "Login", href: "#login" },
              ].map((item) => (
                <button
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 font-medium relative transition-colors duration-300 hover:text-orange-500 group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-900 hover:text-orange-500 focus:outline-none focus:text-orange-500 transition-colors duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {[
                { name: "Home", href: "#home" },
                { name: "Social Media RTM Account", href: "#SocMedAcc" },
                {
                  name: "Social Media Public Statement",
                  href: "#public-statement",
                },
                { name: "AI", href: "#ai" },
                { name: "Determ", href: "#determ" },
                { name: "Contact Us", href: "#contact" },
                { name: "Login", href: "#login" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-900 font-medium hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
    </div>
  );
}
