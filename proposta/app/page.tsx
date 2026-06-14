import { getMvpData } from "@/lib/data";
import { ProposalApp } from "./components/ProposalApp";
import { ArchDiagram } from "./components/ArchDiagram";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getMvpData();
  return <ProposalApp initialData={data} archDiagram={<ArchDiagram />} />;
}
