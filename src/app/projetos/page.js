import Link from "next/link";
import { projects } from "@/data/projects";
import { IconCity, IconCpu, IconLightbulb, IconShield } from "@/components/Icons";

export const metadata = { title: "Projetos • InPACTA" };

const categoryMeta = {
  "governanca": { color: "#0A2540", Icon: IconShield, label: "Governança" },
  "dados-inteligencia": { color: "#3a6fa6", Icon: IconCpu, label: "Dados e Inteligência" },
  "pmo": { color: "#FF6B35", Icon: IconLightbulb, label: "PMO" },
  "tecnologia": { color: "#3a6fa6", Icon: IconCpu, label: "Tecnologia" },
  "cidades-inteligentes": { color: "#27AE60", Icon: IconCity, label: "Cidades Inteligentes" },
  "inovacao": { color: "#FF6B35", Icon: IconLightbulb, label: "Inovação" },
};

export default function Page() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--primary)]">Projetos</h1>
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {projects.map((p) => {
          const { color, Icon, label } = categoryMeta[p.category] || { color: "#0A2540", Icon: IconShield, label: "Governança" };
          return (
            <Link key={p.slug} href={`/projetos/${p.slug}`} className="group glass rounded-xl p-6 block ring-focus">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-[1.06]" style={{ backgroundColor: `${color}1A`, color }}>
                  <Icon aria-hidden width={20} height={20} />
                </span>
                <div>
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-xs" style={{ color }}>{label}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{p.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
