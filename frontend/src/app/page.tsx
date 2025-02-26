"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";
import { Header1 } from "@/components/ui/header";
import {Button, buttonVariants} from "@/components/ui/button";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {/* <Header1 /> */}
      <div className="flex flex-col">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-black dark:text-white">
                Unleash the power of <br />
                <span className="text-9xl md:text-[6rem] font-bold mt-1 leading-none">
                  Ekho
                </span>
              </h1>
            </>
          }
        >
          <Image
            src={`https://ui.aceternity.com/_next/image?url=%2Flinear.webp&w=3840&q=75`}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    </main>
  );
}
