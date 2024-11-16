import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import PlanSelect from "./PlanSelect";

interface AuthFormProps {
  title: string;
  subtitle: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<void>;
  buttonText: string;
  showPlanSelect?: boolean;
  showPhoneInput?: boolean;
  altLink: {
    text: string;
    linkText: string;
    to: string;
  };
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  form,
  onSubmit,
  buttonText,
  showPlanSelect,
  showPhoneInput,
  altLink,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-900">{title}</h2>
      <p className="text-center text-xs text-gray-400 mb-6">{subtitle}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="johndoe@mail.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border-2"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {showPhoneInput && ( // Conditionally show phone input
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="233123456789"
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^\d{12}$/,
                  message: "Invalid phone number",
                },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border-2"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="**********"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border-2"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {showPlanSelect && <PlanSelect register={register} />}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
          {isSubmitting ? "Please wait..." : buttonText}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        {altLink.text}{" "}
        <Link
          to={altLink.to}
          className="text-primary hover:text-primary/90 font-medium">
          {altLink.linkText}
        </Link>
      </p>
    </div>
  );
};
