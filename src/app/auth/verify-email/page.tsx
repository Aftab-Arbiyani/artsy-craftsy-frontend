import VerificationComponent from "@/components/verify-email/VerificationComponent";

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <VerificationComponent id={id} />;
}
