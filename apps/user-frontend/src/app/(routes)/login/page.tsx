import LoginForm from "./LoginForm";
import { FormBranding, Footer } from "../../components/shared/auth";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-start items-center h-screen py-12">
      <FormBranding />
      <LoginForm />
      <Footer />
    </div>
  );
}
