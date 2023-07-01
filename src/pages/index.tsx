import { type NextPage } from 'next';
import Balancer, { Provider } from 'react-wrap-balancer';

const Home: NextPage = () => {
    return (
        <Provider>
            <div className="absolute -z-10 h-screen w-screen object-cover">
                <picture className="h-screen w-screen object-cover">
                    <img
                        src="/temp-rays.png"
                        className=" h-screen w-screen object-cover"
                    />
                </picture>
            </div>
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center  px-12 pb-6 lg:max-w-screen-lg">
                <h1 className="text-2xl font-bold md:mt-16 md:text-6xl">
                    <Balancer>The better way to point things</Balancer>
                </h1>
                <h2 className="mt-6 text-center text-gray-400">
                    <Balancer>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Pellentesque vitae quam ac eros malesuada molestie ac
                        sit amet tortor. Aenean vehicula dignissim dui, et
                        aliquet purus porttitor sed. Nullam hendrerit orci eget
                        aliquet tempor
                    </Balancer>
                </h2>
            </div>
        </Provider>
    );
};

export default Home;
