export default function Hero() {
    const hours = new Date().getHours();
    let greeting;
    if (hours >= 5 && hours < 12) {
        greeting = "Good morning!";
    } else if (hours >= 12 && hours < 18) {
        greeting = "Good afternoon!";
    } else if (hours >= 18 && hours < 22) {
        greeting = "Good evening!";
    } else {
        greeting = "Good night!";
    }
    //TODO: add a rolling list for what i am currently doing
    //TODO: add a avatar wavying hands besides it
    return (
        <div className="min-h-svh flex flex-col justify-center items-end text-center">
            <h1 className="text-4xl font-bold">{greeting}</h1>
            <h1 className="text-4xl font-bold">I'm Kartik — coding solutions, building apps, and exploring the digital world.</h1>
        </div>
    );
}