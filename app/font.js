import { Cookie, Indie_Flower, Lato, Lora, Pacifico, Patrick_Hand, Roboto } from 'next/font/google';
import localFont from 'next/font/local';

export const lato = Lato({ subsets: ['latin'], weight: ['400','700'] });
export const pacifico = Pacifico({ subsets: ['latin'], weight: '400' });
export const cookie = Cookie({subsets: ['latin'], weight: '400' });
export const roboto = Roboto({subsets: ['latin'], weight: '400' });
export const lora = Lora({subsets: ['latin'], weight: '400' });
export const patrick = Patrick_Hand({subsets: ['latin'], weight: '400'});
export const indieflower = Indie_Flower({subsets: ['latin'], weight: '400'});
export const excalifont = localFont({
  src: [
    {
      path: 'fonts/Excalifont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
});