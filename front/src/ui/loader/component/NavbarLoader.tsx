import React from "react";
import Skeleton from "react-loading-skeleton";

const NavbarLoader = () => {
  return (
    <nav className="w-full h-20 bg-(--primary-bg) z-20 fixed flex items-center justify-between px-4 lg:px-10 shadow-custom">
      <div className="flex gap-4 items-center justify-center">
        <div className="shrink-0">
          <Skeleton width={140} height={35} />
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Skeleton width={100} height={25} />
          <Skeleton width={100} height={25} />
          <Skeleton width={100} height={25} />
          <Skeleton width={100} height={25} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <Skeleton circle width={24} height={24} />
        </div>

        <div className="hidden sm:block">
          <Skeleton circle width={24} height={24} />
        </div>

        <div className="flex items-center gap-3 rounded-full relative z-0">
          <div className="absolute top-1 left-1 z-1">
            <Skeleton circle width={25} height={25} />
          </div>

          <div className="w-24">
            <Skeleton width="100%" height={35} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLoader;
