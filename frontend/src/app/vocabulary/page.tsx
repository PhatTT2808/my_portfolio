import PasswordGate from "@/components/PasswordGate";
import VocabularyManager from "./VocabularyManager";

export default function VocabularyPage() {
  return (
    <PasswordGate title="Vocabulary">
      <VocabularyManager />
    </PasswordGate>
  );
}
