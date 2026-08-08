import PasswordGate from "@/components/PasswordGate";
import PlannerWorkspace from "./PlannerWorkspace";

export default function PlannerPage() {
  return (
    <PasswordGate title="Planner">
      <PlannerWorkspace />
    </PasswordGate>
  );
}
