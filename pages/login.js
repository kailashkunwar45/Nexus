import {getProviders, signIn, useSession} from "next-auth/react";
import {useRouter} from "next/router";

export default function LoginPage({providers}) {
  const {data,status} = useSession();
  const router = useRouter();
  if (status === 'loading') {
    return '';
  }
  if (data) {
    router.push('/');
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-nexusDarkGray">
      <div className="mb-8">
        <img src="/logo.png" alt="Nexus Logo" className="h-24 w-24 object-contain rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
      </div>
      <h1 className="text-3xl font-bold mb-8 text-white">Join Nexus Today</h1>
      {providers && Object.values(providers).map(provider => (
        <div key={provider.id}>
          <button onClick={async () => {await signIn(provider.id)}} className="bg-nexusWhite pl-3 pr-5 py-2 text-black rounded-full flex items-center shadow-lg hover:shadow-xl transition-shadow">
            <img src="/google.png" alt="" className="h-8"/>
            <span className="ml-2 font-semibold">Sign in with {provider.name}</span>
          </button>
        </div>
      ))}
      {!providers && (
        <div className="text-nexusLightGray text-center mt-4 bg-nexusBorder p-4 rounded-xl max-w-sm">
          <p>Authentication providers are not configured.</p>
          <p className="text-sm mt-2">Please add <code className="bg-nexusDarkGray px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code> and <code className="bg-nexusDarkGray px-1 py-0.5 rounded">GOOGLE_CLIENT_SECRET</code> to your <code className="bg-nexusDarkGray px-1 py-0.5 rounded">.env</code> file.</p>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: {providers},
  }
}