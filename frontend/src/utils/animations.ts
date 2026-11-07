
import { stagger } from "motion/react";

export const fadeUpContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.15),
    },
  },
};

export const fadeUpItem = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export const fadeUpSection = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.15),
    },
  },
};

export const heroItem = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export const menuVariants = {
    hidden: {
      opacity: 0,
      y: -12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const,
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: {
        duration: 0.15,
        ease: "easeIn" as const,
      },
    },
  };

