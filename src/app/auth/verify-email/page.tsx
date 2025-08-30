import VerificationComponent from "@/components/verify-email/VerificationComponent";

export default function Page({ searchParams }: { searchParams: { id?: string } }) {
  return <VerificationComponent id={searchParams.id} />;
}
