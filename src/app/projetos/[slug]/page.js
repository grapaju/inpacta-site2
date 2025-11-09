import Link from "next/link";
import { projects } from "@/data/projects";
import { IconCity, IconCpu, IconLightbulb, IconShield } from "@/components/Icons";

const categoryMeta = {
  "cidades-inteligentes": { color: "#27AE60", Icon: IconCity, label: "Cidades Inteligentes" },
  tecnologia: { color: "#00A3E0", Icon: IconCpu, label: "Tecnologia" },
  inovacao: { color: "#FF6B35", Icon: IconLightbulb, label: "Inovação" },
};

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const proj = projects.find((p) => p.slug === params.slug);
  if (!proj) return { title: "Projeto não encontrado • InPacta" };
  return { title: `${proj.title} • Projetos • InPacta`, description: proj.description };
}

export default function ProjectPage({ params }) {
  const proj = projects.find((p) => p.slug === params.slug);
  if (!proj) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
        <p className="mt-2 text-[color:var(--muted)]">O projeto solicitado não existe ou foi removido.</p>
        <Link className="mt-4 inline-block underline ring-focus" href="/projetos">Voltar para Projetos</Link>
      </section>
    );
  }
  const { color, Icon, label } = categoryMeta[proj.category] || { color: "#0A2540", Icon: IconShield, label: "Governança" };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="section-title">
        <span className="bar" />
        <h1 className="text-3xl font-bold">{proj.title}</h1>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A`, color }}>
          <Icon aria-hidden width={20} height={20} />
        </span>
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
      </div>
      <p className="mt-4 text-[color:var(--muted)]">{proj.description}</p>

      <div className="mt-8">
        <Link href="/projetos" className="underline ring-focus">← Voltar para listagem</Link>
      </div>
    </section>
  );
}
