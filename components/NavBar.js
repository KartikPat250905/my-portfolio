import { cookie } from '../app/font';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
    return (
        <div className="w-full h-auto min-h-[6vh] flex flex-col sm:flex-row justify-between items-center font-sans p-2 sm:p-3 lg:p-4 sm:text-2xl">
            <h1 className={`${cookie.className} p-1 sm:p-2 lg:p-3 text-theme-primary text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl`}>Portfolio</h1>
            <div className={`${cookie.className} text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl flex flex-wrap justify-center gap-3 sm:gap-5 md:gap-6 lg:gap-8 p-2 sm:p-3 lg:p-6 text-blue-500`}>
                <a
                    className={`${cookie.className} text-blue-500 hover:text-pink-500 underline-center relative px-1 py-1`}
                    href="#hero"
                >
                    Home
                </a>
                <a
                    className={`${cookie.className} text-green-500 hover:text-purple-500 underline-center relative px-1 py-1`}
                    href="#projects"
                >
                    Projects
                </a>
                <a
                    className={`${cookie.className} text-yellow-600 hover:text-indigo-400 underline-center relative px-1 py-1`}
                    href="#stats"
                >
                    Stats
                </a>
                <ThemeToggle />
                <a
                    className={`${cookie.className} text-pink-500 hover:text-blue-500 underline-center relative px-1 py-1`}
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
