import FooterLoader from "@/ui/loader/component/FooterLoader";
import NavbarLoader from "@/ui/loader/component/NavbarLoader";
import Landing from "@/ui/loader/page/landing/landing";
import React from "react";

export default function loading() {
  return (
    <div>
      <NavbarLoader />
      <Landing />
      <FooterLoader />
    </div>
  );
}
