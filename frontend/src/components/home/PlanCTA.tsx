
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { plans } from "../../utils/plans";

import type { CheckoutPayload } from "../../types";

interface PlanCTAProps {
  plan: (typeof plans)[number];
  highlight: boolean;
  startPayment: (payload: CheckoutPayload) => Promise<void>;
  isPending: boolean;
}

function PlanCTA({
  plan,
  highlight,
  startPayment,
  isPending,
}: PlanCTAProps) {
  const { isAuth, user } = useAuth();
  const navigate = useNavigate();

  const isPro =
    Boolean(isAuth && user?.subscription) &&
    new Date(user!.subscription!) > new Date();

  const isFreePlan = plan.name === "Free";

  if (isAuth && isFreePlan) {
    return (
      <p className="mt-auto py-3 text-center text-xs text-white/60">
        {isPro ? "Your previous plan" : "✔️ Currently active"}
      </p>
    );
  }

  if (isAuth && isPro) {
    return (
      <p className="mt-auto py-3 text-center text-xs text-white/60">
        ✔️ Already subscribed
      </p>
    );
  }

  const handleSubscribe = async () => {
    if (!isAuth) {
      navigate("/login");
      return;
    }

    const planPayload: Record<string, CheckoutPayload["plan"]> = {
      "Pro Monthly": "monthly",
      "Pro 6-Month": "sixmonth",
    };

    const selectedPlan = planPayload[plan.name];

    if (!selectedPlan) return;

    await startPayment({ plan: selectedPlan });
  };

  return (
    <button
      type="button"
      className={`mt-auto rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
        highlight
          ? "btn-primary"
          : "border border-white/10 bg-white/6 text-white hover:bg-white/10"
      }`}
      onClick={handleSubscribe}
      disabled={isPending}
    >
      {isPending ? "Processing..." : plan.cta}
    </button>
  );
}

export default PlanCTA;
