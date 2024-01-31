import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

const LogoutPage = async () => {
  const session: any = await auth();

  return (
    <div>
      <form
        action={async () => {
          'use server';

          await signOut();
        }}
      >
        <button>Sign Out</button>
      </form>
    </div>
  );
};

export default LogoutPage;
