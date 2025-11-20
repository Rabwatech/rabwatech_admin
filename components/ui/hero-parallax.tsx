"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Product {
  title: string;
  link: string;
  thumbnail: string;
  description?: string;
}

interface HeroParallaxProps {
  products: Product[];
  isArabic?: boolean;
}

export const HeroParallax: React.FC<HeroParallaxProps> = ({ products, isArabic = false }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Ensure we have products and slice them safely
  const firstRow = products?.slice(0, 5) || [];
  const secondRow = products?.slice(5, 10) || [];
  const thirdRow = products?.slice(10, 15) || [];

  if (!products || products.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">
          {isArabic ? "لا توجد مشاريع لعرضها" : "No projects to display"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header isArabic={isArabic} />
      <motion.div
        style={{
          y,
          opacity,
        }}
      >
        {firstRow.length > 0 && (
          <motion.div className={`flex ${isArabic ? 'flex-row space-x-20' : 'flex-row-reverse space-x-reverse space-x-20'} mb-20`}>
            {firstRow.map((product) => (
              <ProductCard
                product={product}
                key={product.title}
                isArabic={isArabic}
              />
            ))}
          </motion.div>
        )}
        {secondRow.length > 0 && (
          <motion.div className={`flex ${isArabic ? 'flex-row-reverse space-x-reverse space-x-20' : 'flex-row space-x-20'} mb-20`}>
            {secondRow.map((product) => (
              <ProductCard
                product={product}
                key={product.title}
                isArabic={isArabic}
              />
            ))}
          </motion.div>
        )}
        {thirdRow.length > 0 && (
          <motion.div className={`flex ${isArabic ? 'flex-row space-x-20' : 'flex-row-reverse space-x-reverse space-x-20'}`}>
            {thirdRow.map((product) => (
              <ProductCard
                product={product}
                key={product.title}
                isArabic={isArabic}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const Header = ({ isArabic }: { isArabic: boolean }) => {
  return (
    <div className={`max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0 ${isArabic ? 'text-right' : 'text-left'}`}>
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        {isArabic ? (
          <>
            أعمالنا <br /> المميزة
          </>
        ) : (
          <>
            Our Portfolio <br /> of Excellence
          </>
        )}
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        {isArabic 
          ? "نبني منتجات جميلة بأحدث التقنيات والأطر. نحن فريق من المطورين والمصممين المتحمسين الذين يحبون بناء منتجات مذهلة."
          : "We build beautiful products with the latest technologies and frameworks. We are a team of passionate developers and designers that love to build amazing products."
        }
      </p>
    </div>
  );
};

const ProductCard = ({ product, isArabic }: { product: Product; isArabic: boolean }) => {
  if (!product) return null;
  
  return (
    <motion.div
      whileHover={{
        y: -20,
      }}
      className="group/product h-96 w-[30rem] relative shrink-0"
    >
      <a
        href={product.link}
        className="block group-hover/product:shadow-2xl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <div className={`absolute bottom-4 ${isArabic ? 'right-4' : 'left-4'} opacity-0 group-hover/product:opacity-100 text-white`}>
        <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
        {product.description && (
          <p className="text-sm text-gray-300 max-w-xs">
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Add default export for compatibility
export default HeroParallax;
