import { Payment } from "@/components/Payment";
export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Payment id={(await params).id} />;
}
