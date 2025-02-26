"use client"; // This directive ensures the component runs on client-side only

import React, { useRef } from "react";
// Import necessary framer-motion components for animations
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { Button, buttonVariants } from "./button";
import Link from "next/link";

/**
 * ContainerScroll Component - Creates a scrolling container with 3D animation effects
 * @param titleComponent - The title/header content to display
 * @param children - The main content to display inside the card
 */
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  // Reference to the container element for scroll tracking
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // Track if the device is mobile-sized
  const [isMobile, setIsMobile] = React.useState(false);

  // Effect to detect and update mobile state on window resize
  React.useEffect(() => {
    const checkMobile = () => {
      // Use 480px as breakpoint for mobile phones
      setIsMobile(window.innerWidth <= 480);
    };

    // Check initially and add resize listener
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Cleanup resize listener when component unmounts
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Return different scale values based on device size
  const scaleDimensions = () => {
    // Smaller scale values for mobile to fit screen better
    return isMobile ? [0.5, 0.7] : [1.05, 1];
  };

  // Transform values that change with scroll position:
  // As user scrolls from 0% to 20%, these values transition
  const rotate = useTransform(scrollYProgress, [0, 0.2], [10, 0]); // Rotate from 20deg to 0deg
  const scale = useTransform(scrollYProgress, [0, 0.2], scaleDimensions()); // Scale based on device
  const translate = useTransform(scrollYProgress, [0, 0.2], [0, -100]); // Move up 100px

  return (
    <div
      // Tall container to allow for scrolling animation
      // Different heights for mobile vs desktop
      className="h-[40rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-10"
      ref={containerRef}
    >
      <div
        // Inner container with 3D perspective for rotation effect
        className="py-5 md:py-20 w-full relative"
        style={{
          perspective: "1000px", // Creates 3D space for child elements
        }}
      >
        {/* Header component that moves up with scroll */}
        <Header translate={translate} titleComponent={titleComponent} />

        {/* Card component that rotates and scales with scroll */}
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

/**
 * Header Component - The title section that moves up as user scrolls
 * @param translate - Motion value for Y translation
 * @param titleComponent - Content to display in the header
 */
export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate, // Move up based on scroll progress
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

/**
 * Card Component - The main content card with 3D rotation effect
 * @param rotate - Motion value for X-axis rotation
 * @param scale - Motion value for scaling effect
 * @param translate - Motion value for Y translation
 * @param children - Content to display inside the card
 */
export const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate, // 3D rotation on X-axis based on scroll
        scale, // Scale based on scroll
        // Multi-layered shadow for depth effect
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      // Styling for the card with responsive adjustments for mobile
      className="max-w-5xl -mt-24 mx-auto h-[20rem] md:h-[20rem] w-full border-2 md:border-4 border-[#6C6C6C] p-1 md:p-4 bg-[#222222] rounded-[20px] md:rounded-[30px] shadow-xl md:shadow-2xl"
    >
      {/* Inner container for actual content with light/dark mode support */}
      <div className="h-full w-full overflow-hidden rounded-lg md:rounded-2xl bg-gray-100 dark:bg-zinc-900 md:p-2">
        {children}
      </div>
<div className="mt-12 flex justify-center items-center">
<Link href="/sign-in">
          <Button className={buttonVariants({ size: "lg" })}>Get Started</Button>
  
</Link>  
</div>    </motion.div>
  );
};
