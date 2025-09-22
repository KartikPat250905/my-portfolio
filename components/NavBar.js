import { cookie } from '../app/font';

export default function NavBar() {
    return (
        <div className="w-full h-[8vh] flex flex-row justify-between items-center font-sans p-10">
            <h1 className={`${cookie.className} p-8 text-purple-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl`}>Kartik Patel</h1>
            <div className={`${cookie.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl flex gap-8 p-8 text-blue-500`}>
                <a
                className={`${cookie.className} text-blue-500 hover:text-pink-500 underline-center relative`}
                href="#hero"
                >
                Home
                </a>
                <a
                className={`${cookie.className} text-green-500 hover:text-purple-500 underline-center relative`}
                href="#projects"
                >
                Projects
                </a>
                <a
                className={`${cookie.className} text-yellow-600 hover:text-indigo-400 underline-center relative`}
                href="#stats"
                >
                Stats
                </a>
                <a
                className={`${cookie.className} text-pink-500 hover:text-blue-500 underline-center relative`}
                href="#contact"
                >
                Contact
                </a>
            </div>
        </div>
    );
}