import SignupForm from "./SignupForm";
import { FormBranding, Footer } from "../../components/shared/auth";

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-start items-center h-screen py-12">
      <FormBranding />
      <SignupForm />
      <Footer />
    </div>
  );
}
