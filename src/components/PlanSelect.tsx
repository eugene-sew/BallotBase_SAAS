import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface PlanSelectProps {
  register: UseFormReturn<any>["register"];
}

const PlanSelect: React.FC<PlanSelectProps> = ({ register }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Plan Type
      </label>
      <div className="flex gap-4">
        <label className="w-full cursor-pointer">
          <input
            type="radio"
            value="basic"
            {...register("planType")}
            className="sr-only"
            checked={selectedPlan === "basic"}
            onChange={() => setSelectedPlan("basic")}
          />
          <div
            className={`rounded-lg p-4 transition-all border-2 ${
              selectedPlan === "basic"
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-800"
            }`}>
            <h3 className="text-base font-semibold">Basic</h3>
            <p className="text-xs">Limited Elections</p>
          </div>
        </label>

        <label className="w-full cursor-pointer">
          <input
            type="radio"
            value="premium"
            {...register("planType")}
            className="sr-only"
            checked={selectedPlan === "premium"}
            onChange={() => setSelectedPlan("premium")}
          />
          <div
            className={`rounded-lg p-4 transition-all border-2 ${
              selectedPlan === "premium"
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-800"
            }`}>
            <h3 className="text-base font-semibold">Premium</h3>
            <p className="text-xs">Unlimited Elections</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PlanSelect;
