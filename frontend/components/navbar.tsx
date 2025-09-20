"use client";

import {Button} from "@/components/ui/button";
import {Bot, Menu} from "lucide-react";
import Link from "next/link";
import type React from "react"; // Added import for React
import { motion } from "framer-motion";


export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-rai-primary" />
        <span className="text-white font-medium text-xl">
          RAi Compliance Engine
        </span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <NavLink href="/features">Features</NavLink>
        <NavLink href="/how-it-works">How it Works</NavLink>
        <NavLink href="/examples">Examples</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Button className="bg-transparent text-white hover:text-rai-accent">
          Sign In
        </Button>
        <Button className="bg-rai-primary hover:bg-rai-secondary text-white">
          Get Started
        </Button>
      </div>

      <Button className="bg-transparent h-8 w-8 md:hidden text-white">
        <Menu className="w-6 h-6" />
      </Button>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rai-primary transition-all group-hover:w-full" />
    </Link>
  );
}
