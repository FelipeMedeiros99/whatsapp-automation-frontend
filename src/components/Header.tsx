"use client"

import Image from "next/image"
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoMenu } from "react-icons/io5";

export default function Header() {
  const links = [
    { to: "/", key: "Conectar" },
    { to: "/restriction", key: "Configurar restrição" }
  ];
  const [isRightBarVisible, setIsRightBarVisible] = useState(false);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {

      if (rightRef.current && !rightRef.current.contains(e.target as Node)) {
        setIsRightBarVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
     <header className="bg-white shadow-md px-4 py-2 flex items-center justify-between relative z-50">
      <div className="relative w-32 h-10"> 
        <Image
          src={"/images/logo.png"}
          alt="logo gree hotel"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <IoMenu
        className="text-3xl cursor-pointer md:hidden"
        onClick={() => setIsRightBarVisible(prev => !prev)}
      />
      <nav className="hidden md:flex space-x-6">
        {links.map((link) => (
          <Link
            href={link.to}
            key={link.key}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            {link.key}
          </Link>
        ))}
      </nav>

      <div
        ref={rightRef}
        className={`
          md:hidden
          fixed top-0 right-0 h-full w-64 bg-gray-100 shadow-lg p-5 z-40
          transform transition-transform duration-300 ease-in-out
          ${isRightBarVisible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <ul className="flex flex-col space-y-4 pt-16">
          {links.map((link) => (
            <li key={link.key}>
              <Link
                href={link.to}
                onClick={() => setIsRightBarVisible(false)} 
                className="text-gray-800 hover:text-blue-700 text-lg"
              >
                {link.key}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}