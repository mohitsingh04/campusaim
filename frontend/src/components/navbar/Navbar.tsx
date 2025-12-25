import Link from "next/link";
import Image from "next/image";
import NavbarClient from "./NavbarClient";

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <h1 className="relative h-10 w-44 sm:w-56 md:w-64">
              <Image
                src="/img/logo/campusaim-logo.png"
                alt="Campusaim Black Logo"
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-105"
                sizes="auto"
              />
            </h1>
          </Link>

          {/* Right Navigation (Client Side) */}
          <NavbarClient />
        </div>
      </div>
    </nav>
  );
}
