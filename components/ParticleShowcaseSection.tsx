import Reveal from "./Reveal";
import ParticleHeading from "./ParticleHeading";

export default function ParticleShowcaseSection() {
  return (
    <section className="relative bg-surface" style={{ height: "200svh" }}>
      <div className="sticky top-0 flex h-svh w-full items-center justify-center px-4 md:px-10">
        <Reveal variant="scale" className="h-[82svh] w-full">
          <ParticleHeading
            text="Une matière qui réagit à votre présence."
            className="h-full w-full"
          />
        </Reveal>
      </div>
    </section>
  );
}
