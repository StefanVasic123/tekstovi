import { auth, signOut } from '@/auth';

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
