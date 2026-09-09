import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { plans } from "../../utils/plans";

import type { CheckoutPayload, User } from "../../types";

interface PlanCTAProps {
  plan: (typeof plans)[0];
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

  const userSub = (user as User)?.subscription;

  const isPro =
    isAuth && userSub && new Date() < new Date(userSub);

  if (isAuth) {
    if (plan.name === "Free") {
      return (
        <p className="mt-auto text-center text-xs text-white/30 py-3">
          {isPro ? "Your previous plan" : "✔️ Currently active"}
        </p>
      );
    }

    if (isPro) {
      return (
        <p className="mt-auto text-center text-xs text-white/30 py-3">
          ✔️ Already subscribed
        </p>
      );
    }
  }

  const handleSubscribe = () => {
  if (!isAuth) {
    navigate("/login");
    return;
  }

  if (plan.name === "Pro Monthly") {
    startPayment({
      plan: "monthly",
    });

    return;
  }

  if (plan.name === "Pro 6-Month") {
    startPayment({
      plan: "six_month",
    });
  }
};

  return (
    <button
      className={`mt-auto text-center text-sm font-semibold py-3 rounded-xl transition-all duration-200 ${
        highlight
          ? "btn-primary"
          : "bg-white/6 hover:bg-white/10 border border-white/10 text-white"
      }`}
      onClick={handleSubscribe}
      disabled={isPending}
    >
      {isPending ? "Processing..." : plan.cta}
    </button>
  );
}

export default PlanCTA;