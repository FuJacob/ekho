"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";
import { Header1 } from "@/components/ui/header";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
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

      <div className="bg-black h-[500px] w-[1000px] text-center p-12 gap-12 rounded-2xl flex flex-col justify-center items-center text-white">
        <h1 className="font-bold">What is Ekho.</h1>
        <h2 className="font-black text-5xl">
          AI phone agents that sound human, speak any language, and work 24/7.
        </h2>
        <p>
          Bland makes it simple to integrate the latest conversational AI
          technology into your business. Build the perfect employee to handle
          sales, scheduling, and all your customer support needs. Bland’s AI
          phone agents sound human, can speak any language, and work 24/7.
        </p>
        <div>
          <Link href="/sign-up">
            <Button className={buttonVariants({ variant: "secondary" })}>
              Sign up today
            </Button>
          </Link>{" "}
          <Link href="/demo">
            <Button className={buttonVariants({ variant: "secondary" })}>
              Watch Demo
            </Button>
          </Link>
        </div>
      </div>

      <div className="h-[800px] flex items-center">
        <section className="w-[1000px] h-[500px] flex flex-row gap-12">
          <div className="flex flex-col items-center justify-center gap-12 text-center w-1/3">
           <div>
              <h1 className="font-bold">How Ekho is built.</h1>
              <h2 className="font-black text-5xl">
                Self-hosted, end-to-end infrastructure.
              </h2>
           </div>
            <p>
              Bland provides fully self-hosted, end-to-end infrastructure. That
              means faster response times, 99.99% uptime, and guaranteed
              security for your--and your customer’s--data. And your marginal
              call costs? Zero.
            </p>
            <Link href="/demo">
              <Button>Watch Demo</Button>
            </Link>{" "}
          </div>
          <div className="grid grid-cols-2 gap-8 w-2/3 text-white">
            <div className="bg-black rounded-2xl p-6">
              <h1 className="font-bold text-2xl">Write Custom Prompts</h1>
              <p className="mt-12">
                Provide your agent with sample dialogue and relevant details to
                personalize interactions with your customers.
              </p>
            </div>

            <div className="bg-black rounded-2xl p-6">
              <h1 className="font-bold text-2xl">Write Custom Prompts</h1>
              <p className="mt-12">
                Provide your agent with sample dialogue and relevant details to
                personalize interactions with your customers.
              </p>
            </div>
            <div className="bg-black rounded-2xl p-6">
              <h1 className="font-bold text-2xl">Write Custom Prompts</h1>
              <p className="mt-12">
                Provide your agent with sample dialogue and relevant details to
                personalize interactions with your customers.
              </p>
            </div>
            <div className="bg-black rounded-2xl p-6">
              <h1 className="font-bold text-2xl">Write Custom Prompts</h1>
              <p className="mt-12">
                Provide your agent with sample dialogue and relevant details to
                personalize interactions with your customers.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
