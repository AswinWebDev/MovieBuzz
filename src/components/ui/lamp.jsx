"use client";
import React from "react";
import { motion } from "framer-motion";

// Simple utility function to combine class names
const cn = (...inputs) => inputs.filter(Boolean).join(' ');

export const LampContainer = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden w-full rounded-md z-0",
        className
      )}
      style={{ backgroundColor: '#0f172a' }} // Slate-950 equivalent
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, #06b6d4, transparent, transparent)`,
            position: 'absolute',
            inset: 'auto',
            right: '50%',
            height: '14rem',
            overflow: 'visible',
            width: '30rem',
          }}
        >
          <div style={{
            position: 'absolute',
            width: '100%',
            left: 0,
            backgroundColor: '#0f172a',
            height: '10rem',
            bottom: 0,
            zIndex: 20,
            maskImage: 'linear-gradient(to top, white, transparent)'
          }} />
          <div style={{
            position: 'absolute',
            width: '10rem',
            height: '100%',
            left: 0,
            backgroundColor: '#0f172a',
            bottom: 0,
            zIndex: 20,
            maskImage: 'linear-gradient(to right, white, transparent)'
          }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, #06b6d4)`,
            position: 'absolute',
            inset: 'auto',
            left: '50%',
            height: '14rem',
            width: '30rem',
          }}
        >
          <div style={{
            position: 'absolute',
            width: '10rem',
            height: '100%',
            right: 0,
            backgroundColor: '#0f172a',
            bottom: 0,
            zIndex: 20,
            maskImage: 'linear-gradient(to left, white, transparent)'
          }} />
          <div style={{
            position: 'absolute',
            width: '100%',
            right: 0,
            backgroundColor: '#0f172a',
            height: '10rem',
            bottom: 0,
            zIndex: 20,
            maskImage: 'linear-gradient(to top, white, transparent)'
          }} />
        </motion.div>
        <div style={{
          position: 'absolute',
          top: '50%',
          height: '12rem',
          width: '100%',
          transform: 'translateY(3rem) scaleX(1.5)',
          backgroundColor: '#0f172a',
          filter: 'blur(1rem)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          zIndex: 50,
          height: '12rem',
          width: '100%',
          backgroundColor: 'transparent',
          opacity: 0.1,
          backdropFilter: 'blur(1rem)'
        }}></div>
      
        {/* <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            inset: 'auto',
            zIndex: 30,
            height: '9rem',
            width: '16rem',
            transform: 'translateY(-6rem)',
            borderRadius: '9999px',
            backgroundColor: '#22d3ee',
            filter: 'blur(1rem)'
          }}
        ></motion.div> */}
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            inset: 'auto',
            zIndex: 50,
            height: '0.125rem',
            width: '30rem',
            transform: 'translateY(-7rem)',
            backgroundColor: '#22d3ee'
          }}
        ></motion.div>

        <div style={{
          position: 'absolute',
          inset: 'auto',
          zIndex: 40,
          height: '11rem',
          width: '100%',
          transform: 'translateY(-12.5rem)',
          backgroundColor: '#0f172a'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 50,
        display: 'flex',
        transform: 'translateY(-20rem)',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 1.25rem'
      }}>
        {children}
      </div>
    </div>
  );
};

export function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        style={{
          marginTop: '2rem',
          background: 'linear-gradient(to bottom right, #e2e8f0, #94a3b8)',
          padding: '1rem 0',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          fontSize: '2.25rem',
          fontWeight: 500,
          letterSpacing: '-0.025em',
          lineHeight: 1.25
        }}
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}
