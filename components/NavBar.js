/**
 * NavBar.js
 * Navigation bar component for the portfolio.
 * Sticky, glass-blur bar with theme-aware colors and a neon-pink accent
 * (matches the accent used in TechStack/WorkExperience). Collapses into a
 * hamburger menu below the sm breakpoint instead of wrapping the link row.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { patrick } from "../app/font";
import ThemeToggle from "./ThemeToggle";

// Single source of truth for links so desktop and mobile menus can't drift
// out of sync, and so adding a new section is a one-line change.
const NAV_LINKS = [
    { label: "Home", href: "#hero" },
    { label: "Work", href: "#work" },
    { label: "Projects", href: "#projects" },
    { label: "History", href: "#history" },
    { label: "Stats", href: "#stats" },
    { label: "Feedback", href: "#feedback" },
    { label: "Contact", href: "#contact" },
];

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Slight elevation/border once the user scrolls, so the bar reads as
    // "floating" over content rather than a flat strip pinned at the top.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close the mobile menu after a link is tapped, so it doesn't stay open
    // covering the section the user just navigated to.
    const handleLinkClick = () => setMenuOpen(false);

    return (
        <nav className={`nav-root ${scrolled ? "nav-scrolled" : ""}`}>
            <div className="nav-inner">
                <a href="#hero" className={`${patrick.className} nav-logo`}>
                    Portfolio
                </a>

                {/* Desktop links */}
                <div className="nav-links-desktop">
                    <div className="nav-pill">
                        {NAV_LINKS.map((link) => (
                            <a key={link.href} className="nav-link" href={link.href}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <ThemeToggle />
                </div>

                {/* Mobile controls */}
                <div className="nav-mobile-controls">
                    <ThemeToggle />
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        className={`nav-burger ${menuOpen ? "nav-burger-open" : ""}`}
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        <span className={`nav-burger-line ${menuOpen ? "line-1-open" : ""}`} />
                        <span className={`nav-burger-line ${menuOpen ? "line-2-open" : ""}`} />
                        <span className={`nav-burger-line ${menuOpen ? "line-3-open" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="nav-mobile-menu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <div className="nav-mobile-menu-inner">
                            {NAV_LINKS.map((link, i) => (
                                <motion.a
                                    key={link.href}
                                    className="nav-mobile-link"
                                    href={link.href}
                                    onClick={handleLinkClick}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.03 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .nav-root {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    width: 100%;
                    background: color-mix(in srgb, var(--background) 40%, transparent);
                    backdrop-filter: blur(14px) saturate(140%);
                    -webkit-backdrop-filter: blur(14px) saturate(140%);
                    border-bottom: 1px solid transparent;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease,
                        background-color 0.3s ease;
                }

                .nav-scrolled {
                    border-bottom-color: var(--border-color);
                    box-shadow: 0 4px 24px -4px var(--shadow-color);
                }

                .nav-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0.75rem 1rem;
                }

                @media (min-width: 640px) {
                    .nav-inner {
                        padding: 0.9rem 1.5rem;
                    }
                }

                .nav-logo {
                    color: var(--text-primary);
                    font-size: 1.5rem;
                    text-decoration: none;
                    text-shadow: 0 0 12px #f92ceb55;
                    transition: text-shadow 0.25s ease, transform 0.25s ease;
                }

                .nav-logo:hover {
                    text-shadow: 0 0 18px #f92ceb99, 0 0 32px #f92ceb44;
                    transform: rotate(-1.5deg);
                }

                @media (min-width: 640px) {
                    .nav-logo {
                        font-size: 1.75rem;
                    }
                }

                @media (min-width: 1024px) {
                    .nav-logo {
                        font-size: 2rem;
                    }
                }

                /* Desktop nav: hidden below sm, flex from sm up */
                .nav-links-desktop {
                    display: none;
                }

                @media (min-width: 640px) {
                    .nav-links-desktop {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                }

                @media (min-width: 1024px) {
                    .nav-links-desktop {
                        gap: 1.5rem;
                    }
                }

                /* Pill container gives the link row its own "sketch" edge,
                   echoing .sketch-border from globals.css without the
                   double-line shadow (too busy at this size). */
                .nav-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.35rem;
                    border: 1.5px solid var(--border-color);
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--background) 30%, transparent);
                }

                @media (min-width: 1024px) {
                    .nav-pill {
                        gap: 0.35rem;
                        padding: 0.4rem 0.5rem;
                    }
                }

                .nav-link {
                    position: relative;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    font-weight: 500;
                    text-decoration: none;
                    padding: 0.4rem 0.75rem;
                    border-radius: 999px;
                    transition: color 0.2s ease, background-color 0.2s ease;
                }

                @media (min-width: 1024px) {
                    .nav-link {
                        font-size: 1rem;
                        padding: 0.45rem 0.9rem;
                    }
                }

                .nav-link:hover {
                    color: #f92ceb;
                    background: #f92ceb14;
                }

                .nav-link::after {
                    content: "";
                    position: absolute;
                    left: 50%;
                    bottom: 0.15rem;
                    width: 0%;
                    height: 2px;
                    border-radius: 2px;
                    background: #f92ceb;
                    box-shadow: 0 0 8px #f92ceb99;
                    transition: width 0.25s ease, left 0.25s ease;
                }

                .nav-link:hover::after {
                    width: calc(100% - 1.5rem);
                    left: 0.75rem;
                }

                /* Mobile controls: hidden from sm up */
                .nav-mobile-controls {
                    display: flex;
                    align-items: center;
                    flex-direction: row;
                    gap: 0.75rem;
                    flex-shrink: 0;
                }

                :global(.nav-mobile-controls .theme-toggle),
                :global(.nav-links-desktop .theme-toggle) {
                    position: static;
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    z-index: auto;
                }

                @media (min-width: 640px) {
                    .nav-mobile-controls {
                        display: none;
                    }
                }

                .nav-burger {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 5px;
                    width: 34px;
                    height: 34px;
                    padding: 0;
                    background: transparent;
                    border: 1.5px solid transparent;
                    border-radius: 999px;
                    cursor: pointer;
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                }

                .nav-burger:hover,
                .nav-burger-open {
                    border-color: var(--border-color);
                    box-shadow: 0 0 10px var(--shadow-color);
                }

                .nav-burger-line {
                    display: block;
                    width: 16px;
                    height: 2px;
                    background: var(--text-primary);
                    border-radius: 2px;
                    transition: transform 0.25s ease, opacity 0.25s ease, background-color 0.25s ease;
                }

                .nav-burger:hover .nav-burger-line {
                    background: #f92ceb;
                }

                .line-1-open {
                    transform: translateY(7px) rotate(45deg);
                }

                .line-2-open {
                    opacity: 0;
                }

                .line-3-open {
                    transform: translateY(-7px) rotate(-45deg);
                }

                .nav-mobile-menu {
                    overflow: hidden;
                    border-top: 1px solid var(--border-color);
                    background: color-mix(in srgb, var(--background) 55%, transparent);
                    backdrop-filter: blur(14px);
                }

                @media (min-width: 640px) {
                    .nav-mobile-menu {
                        display: none;
                    }
                }

                .nav-mobile-menu-inner {
                    display: flex;
                    flex-direction: column;
                    padding: 0.5rem 1rem 1rem;
                }

                .nav-mobile-link {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    text-decoration: none;
                    padding: 0.75rem 0.25rem;
                    border-bottom: 1px solid transparent;
                    transition: color 0.2s ease, padding-left 0.2s ease, border-color 0.2s ease;
                }

                .nav-mobile-link:hover,
                .nav-mobile-link:active {
                    color: #f92ceb;
                    padding-left: 0.6rem;
                    border-bottom-color: color-mix(in srgb, #f92ceb 40%, transparent);
                }
            `}</style>
        </nav>
    );
}