import SignupForm from "./SignupForm";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="bg-[#232f3e] px-4 pb-20 pt-10 text-center text-white sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">AWS Builder Center</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Campus Leader Sign-up</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300 sm:text-base">
          Already signed up on AWS Builder Center? Confirm your details below.
        </p>
      </header>
      <div className="-mt-12 flex-1 px-4 pb-10">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-8">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
