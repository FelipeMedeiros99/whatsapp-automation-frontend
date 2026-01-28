"use client"

import Image from "next/image"
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";

export default function Header() {
  const links = [
    { to: "/", key: "Conectar" },
    { to: "/restriction", key: "Configurar restrição" },
    { to: "/default_messages", key: "Configurar mensagens" }
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
          md:hidden {/* Esconde em telas médias e maiores */}
          fixed top-0 right-0 h-full w-72 {/* Aumentei um pouco a largura */}
          bg-white {/* Fundo branco para melhor contraste */}
          shadow-xl {/* Sombra mais pronunciada */}
          p-6 {/* Mais padding interno */}
          z-40
          transform transition-transform duration-300 ease-in-out
          flex flex-col {/* Layout de coluna para organizar conteúdo */}
          ${isRightBarVisible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200"> 
          <div className="flex items-center space-x-3">
            
            <div className="relative w-10 h-10"> 
              <Image
                src={"/images/logo.png"}
                alt="logo gree hotel"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            
            <span className="text-xl font-bold text-gray-800">GreeHotel</span>
          </div>
          
          <button
            onClick={() => setIsRightBarVisible(false)}
            className="text-gray-500 hover:text-gray-800 text-3xl"
            aria-label="Fechar menu"
          >
            <IoClose />
          </button>
        </div>

        
        <nav className="grow"> 
          <ul className="flex flex-col space-y-5"> 
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.to}
                  onClick={() => setIsRightBarVisible(false)}
                  className="
                    flex items-center space-x-3 {/* Alinha ícone e texto se você adicionar ícones */}
                    text-gray-700 hover:text-blue-600 hover:bg-gray-100 {/* Efeito hover */}
                    p-2 rounded-md {/* Padding e borda arredondada no hover */}
                    text-lg transition-colors duration-150 ease-in-out
                  "
                >
                  <span>{link.key}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto text-center text-sm text-gray-500">
          © 2025 GreeHotel
        </div>
      </div>
    </header>
  );
}