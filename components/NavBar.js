import { cookie } from '../app/font';

export default function NavBar() {
    return (
        <div className="w-full h-auto min-h-[8vh] flex flex-col sm:flex-row justify-between items-center font-sans p-4 sm:p-6 lg:p-10">
            <h1 className={`${cookie.className} p-2 sm:p-4 lg:p-8 text-black text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl`}>Portfolio</h1>
            <div className={`${cookie.className} text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 p-3 sm:p-4 lg:p-8 text-blue-500`}>
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
                <a
                className={`${cookie.className} text-pink-500 hover:text-blue-500 underline-center relative px-1 py-1`}
                href="#contact"
                >
                Contact
                </a>
            </div>
        </div>
    );
}
