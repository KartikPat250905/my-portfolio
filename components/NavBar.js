import { pacifico } from '../app/font';

export default function NavBar() {
    return (
        <div className="w-full h-[8vh] flex flex-row justify-between items-center font-sans">
            <h1 className="p-4">Kartik Patel</h1>
            <div className={`${pacifico.className} + flex gap-8 p-8 font-nav`}>
                <a href="#hero" className="shadow-md">Home</a>
                <a href="#projects">Projects</a>
                <a href="#projects">Stats</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
    );
}