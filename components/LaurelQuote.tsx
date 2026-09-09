import Reveal from "./Reveal";
import { LaurelBranch } from "./icons";

export default function LaurelQuote() {
  return (
    <Reveal variant="scale">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-4 px-6 text-center md:gap-6">
        <LaurelBranch className="h-16 w-7 shrink-0 text-brass md:h-20 md:w-8" />
        <p className="font-body text-base text-bone-dim md:text-lg">
          Richard McClintock, a Latin professor at Hampden-Sydney College in
          Virginia.
        </p>
        <LaurelBranch flip className="h-16 w-7 shrink-0 text-brass md:h-20 md:w-8" />
      </div>
    </Reveal>
  );
}
