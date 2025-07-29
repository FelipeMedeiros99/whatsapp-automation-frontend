"use client"

import Image from "next/image"
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoMenu } from "react-icons/io5";

export default function Header() {
  const links = [{to: "/", key: "Home"}, {to: "/messages", key: "Configurar Mensagens"}]
  const [isRighBarVisible, setIsRightVarVisible] = useState(false)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const viewClick = (e: MouseEvent)=>{
      const click = e.target as HTMLElement;
      if(rightRef.current){
        if(!rightRef.current.contains(click)){
          setIsRightVarVisible(false)
        }
      }
    }
    document.addEventListener("mousedown", viewClick)

    return ()=>{document.removeEventListener("mousedown", viewClick)}
  })
  
  return(
  <div className="header">
    <div className="container-image">
      <Image src={"/images/logo.png"} alt="logo gree hotel" fill/>
    </div>
    <IoMenu className="icon" onClick={()=>setIsRightVarVisible(prev=>!prev)}/>

    <div className={isRighBarVisible?"right-bar":"right-bar none"} ref={rightRef}>
      <ul className="container-links">
        {links.map((link)=>(
          <Link href={link.to} key={link.key}>{link.key}</Link>
        ))}

      </ul>
    </div>
  </div>
  )
}