import { useRouter } from 'next/router';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { signIn } from 'next-auth/react';

import { useUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { SignIn } from '@/components/sign-in';

const Login = () => {
    const { status } = useUser();
    const router = useRouter();

    if (status === 'loading') return null;

    if (status === 'authenticated') {
        if (status === 'authenticated') {
            void router.push('/');
        }
    }

    if (status === 'anon') {
        return (
            <div className="m-auto">
                <Button
                    variant="outline"
                    className="border-black hover:!bg-[#00000000]  dark:border-white"
                    onClick={() => void signIn('github')}
                >
                    Sign in with Github <GitHubLogoIcon className="ml-2" />
                </Button>
            </div>
        );
    }
    if (status === 'unauthenticated') {
        return (
            <div className="m-auto">
                <SignIn />
            </div>
        );
    }
    return null;
};
export default Login;
