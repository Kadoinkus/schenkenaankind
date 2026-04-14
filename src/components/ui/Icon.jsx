import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Component,
  FileText,
  HandCoins,
  Home,
  Landmark,
  Play,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

const iconMap = {
  alert: AlertTriangle,
  arrow: ArrowRight,
  balance: Landmark,
  book: BookOpen,
  calculator: Calculator,
  check: CheckCircle2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  components: Component,
  family: HandCoins,
  fileText: FileText,
  help: CircleHelp,
  house: Home,
  play: Play,
  shield: ShieldCheck,
  chart: TrendingUp,
  users: Users,
};

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = "",
}) {
  const Component = iconMap[name] || BookOpen;

  return (
    <Component
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={`icon ${className}`.trim()}
    />
  );
}
