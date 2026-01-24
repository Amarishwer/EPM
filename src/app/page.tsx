


"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

function Slideshow() {
  const images = [
    "/skyline2.png",
    "/skyline5.png",
    "/skyline7.png",
    "/skyline8.png",
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);

  const validImage = images[current] && images[current] !== "";
  return (
    <div className="relative w-full flex justify-center items-center mb-8">
      {validImage && (
        <Image
          src={images[current]}
          alt={`Slideshow image ${current + 1}`}
          width={900}
          height={240}
          className="w-full h-[240px] object-cover rounded transition-all duration-700"
          priority
        />
      )}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#cd7f32] hover:bg-[#b87333] text-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-[#cd7f32]"
            aria-label="Previous slide"
          >
            <span className="text-white">&#8592;</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#cd7f32] hover:bg-[#b87333] text-white rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-[#cd7f32]"
            aria-label="Next slide"
          >
            <span className="text-white">&#8594;</span>
          </button>
        </>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === current ? 'bg-[#cd7f32]' : 'bg-gray-300'} inline-block`}
          />
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="w-full bg-[#f7f7fa] py-0 mb-0 shadow">
      <div className="max-w-2xl mx-auto px-0 flex justify-center items-center">
        <Image
          src="/EPM logo.png"
          alt="EPM Logo"
          width={170}
          height={200}
          className="object-cover scale-115 mix-blend-multiply mx-auto my-0"
        />
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-0">
      <Header />
      <Slideshow />
      <div className="w-full flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold text-[#092136] text-center mb-2">Welcome to Edam Property Management</h1>
        <h2 className="text-xl font-medium text-blue-700 text-center">Property Management and Development in Hyderabad City</h2>
      </div>
      <div className="flex flex-col items-center mb-6">
        <Link href="/resident-login">
          <button className="mb-8 bg-[#cd7f32] text-white px-8 py-3 rounded-full text-lg font-bold shadow hover:bg-[#b87333] transition border-2 border-[#cd7f32] hover:border-[#b87333] focus:outline-none focus:ring-2 focus:ring-[#cd7f32]">
            Resident Login
          </button>
        </Link>
      </div>
      <div className="max-w-2xl w-full bg-white rounded shadow-md p-8 flex flex-col items-center">
        <p className="text-lg text-gray-700 mb-6 text-center">
          We provide comprehensive property management services including tenant placement, rent collection, maintenance, and more. Our team is dedicated to making your rental experience seamless and stress-free.
        </p>
        <div className="mb-6 w-full">
          <h2 className="text-2xl font-semibold mb-2 text-blue-600">Our Services</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Tenant Placement & Screening</li>
            <li>Rent Collection & Accounting</li>
            <li>Property Maintenance & Repairs</li>
            <li>24/7 Emergency Support</li>
            <li>Online Resident Portal</li>
          </ul>
        </div>
        <div className="mb-6 w-full">
          <h2 className="text-2xl font-semibold mb-2 text-blue-600">Contact Us</h2>
          <p className="text-gray-700">Phone: +91 9440348141</p>
          <p className="text-gray-700">Email: info@edamproperty.com</p>
          <p className="text-gray-700">H.no: 11-11-143, Telephone colony, Saroornagar, Hyderabad, Telangana 500035, India.</p>
        </div>
      </div>
    </div>
  );
}
