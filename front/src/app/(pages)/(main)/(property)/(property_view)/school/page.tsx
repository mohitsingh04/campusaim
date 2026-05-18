import { redirect } from "next/navigation";
export default function Page() {
  redirect(`/schools`);
  return null;
}
