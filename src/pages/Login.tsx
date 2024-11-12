import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from '../components/AuthForm';

interface LoginFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <AuthForm
        title="Welcome Back"
        subtitle="Sign in to your account"
        form={form}
        onSubmit={onSubmit}
        buttonText="Sign In"
        altLink={{
          text: "Don't have an account?",
          linkText: "Register",
          to: "/register"
        }}
      />
    </div>
  );
};