import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { AuthForm } from "../components/AuthForm";

interface RegisterFormData {
  email: string;
  password: string;
  planType: "basic" | "premium";
  phone: string;
}

export const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const form = useForm<RegisterFormData>({
    defaultValues: {
      planType: "basic",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp(data.email, data.password, data.planType, data.phone);
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      navigate("/login");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <AuthForm
        title="Create Account"
        subtitle="Start managing your elections"
        form={form}
        onSubmit={onSubmit}
        buttonText="Register"
        showPlanSelect
        showPhoneInput
        altLink={{
          text: "Already have an account?",
          linkText: "Sign In",
          to: "/login",
        }}
      />
    </div>
  );
};
