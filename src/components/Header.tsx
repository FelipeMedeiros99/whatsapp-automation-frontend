import Image from "next/image"

export default function Header() {
  return(
  <div className="header">
    <div className="container-image">
      <Image src={"/images/logo.png"} alt="logo gree hotel" fill/>
    </div>
  </div>
  )
}