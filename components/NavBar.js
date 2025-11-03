import { patrick } from '../app/font';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
    return (
        <div className="w-full h-auto min-h-[6vh] flex flex-col sm:flex-row justify-between items-center font-sans p-3 sm:p-4 lg:p-5">
            <h1
                className={`${patrick.className} text-theme-primary
                text-3xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl
                p-2 sm:p-3 lg:p-4`}
            >
                Portfolio
            </h1>
            <div
                className={`${patrick.className}
                flex flex-wrap justify-center items-center
                text-2xl sm:text-xl md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl
                gap-4 sm:gap-6 md:gap-8 lg:gap-10
                p-3 sm:p-4 lg:p-6
                text-blue-500`}
            >
                <a
                    className="text-blue-500 hover:text-pink-500 underline-center relative px-1 py-1"
                    href="#hero"
                >
                    Home
                </a>
                <a
                    className="text-green-500 hover:text-purple-500 underline-center relative px-1 py-1"
                    href="#projects"
                >
                    Projects
                </a>
                <a
                    className="text-yellow-600 hover:text-indigo-400 underline-center relative px-1 py-1"
                    href="#stats"
                >
                    Stats
                </a>
                <a
                    className="text-pink-500 hover:text-blue-500 underline-center relative px-1 py-1"
                    href="#contact"
                >
                    Contact
                </a>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
}
