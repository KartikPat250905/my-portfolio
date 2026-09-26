"use client";
import { motion, AnimatePresence } from "framer-motion";
import { patrick } from "../app/font";

interface LoadingScreenProps {
  isLoading: boolean;
  label?: string;
}

export default function LoadingScreen({ isLoading, label = "Loading" }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loading-root"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="loading-grid" />

          <div className="loading-center">
            <div className="loading-ring">
              <span className="loading-ring-glow" />
            </div>

            <motion.p
              className={`${patrick.className} loading-label`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {label}
              <span className="loading-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}