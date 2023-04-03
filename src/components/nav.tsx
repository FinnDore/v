import { useUser } from '@/utils/local-user';
import { Glitch } from './glitch';
import { Pfp } from './pfp';

export const Nav = () => {
    const { status, user } = useUser();
    const name = status === 'authenticated' ? user.user.name : user?.name;

    return (
        <nav className="pointer-events-none mx-auto flex w-full min-w-max max-w-[90ch] px-12 py-4">
            <div className="pointer-events-auto flex text-2xl">
                <b>V</b>
                <Glitch text="ote" />
            </div>
            {name && (
                <div className="text-md pointer-events-auto ml-auto mr-4 flex align-middle">
                    <Pfp name={name} className="my-auto mr-3 ms-auto w-6" />
                    <div className="my-auto h-min">{name}</div>
                </div>
            )}
        </nav>
    );
};
