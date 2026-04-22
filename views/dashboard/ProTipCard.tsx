import { HighlightCard } from '@/components/ui/HighlightCard';

interface ProTipCardProps {
  tip?: string;
  onLearnMore?: () => void;
}

export function ProTipCard({
  tip = "Doctors are 40% more likely to prescribe when shown the clinical efficacy slides first.",
  onLearnMore,
}: ProTipCardProps) {
  return (
    <HighlightCard
      title="Pro Tip"
      description={tip}
      actionLabel="Learn More"
      onAction={onLearnMore}
    />
  );
}
