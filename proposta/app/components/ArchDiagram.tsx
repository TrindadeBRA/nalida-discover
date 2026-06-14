"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Handle,
  Position,
  useEdgesState,
  useNodesState,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ─── palette ─────────────────────────────────────── */
const C = {
  green:    "#01605B",
  greenMid: "#28a19b",
  lime:     "#a6ce42",
  orange:   "#f5963b",
  blue:     "#4a9eff",
  purple:   "#9b59ff",
  red:      "#f85149",
  bg:       "#111e19",
  bgCard:   "#161f1c",
  border:   "#1f3028",
  text:     "#e8f0ec",
  textDim:  "#8fada4",
};

/* ─── custom node ──────────────────────────────────── */
interface NodeData {
  label: string;
  sub?: string;
  icon: string;
  color: string;
  handles?: ("top" | "bottom" | "left" | "right")[];
  [key: string]: unknown;
}

function ArchNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div style={{
      background: C.bgCard,
      border: `1.5px solid ${d.color}`,
      borderRadius: 12,
      padding: "12px 16px",
      minWidth: 140,
      textAlign: "center",
      boxShadow: `0 0 18px ${d.color}33`,
      position: "relative",
    }}>
      {(d.handles ?? ["top","bottom"]).includes("top") && (
        <Handle type="target" position={Position.Top} style={{ background: d.color, border: "none", width: 8, height: 8 }} />
      )}
      {(d.handles ?? ["top","bottom"]).includes("left") && (
        <Handle type="target" position={Position.Left} style={{ background: d.color, border: "none", width: 8, height: 8 }} />
      )}
      <div style={{ fontSize: 22, marginBottom: 4 }}>{d.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{d.label}</div>
      {d.sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>{d.sub}</div>}
      {(d.handles ?? ["top","bottom"]).includes("bottom") && (
        <Handle type="source" position={Position.Bottom} style={{ background: d.color, border: "none", width: 8, height: 8 }} />
      )}
      {(d.handles ?? ["top","bottom"]).includes("right") && (
        <Handle type="source" position={Position.Right} style={{ background: d.color, border: "none", width: 8, height: 8 }} />
      )}
    </div>
  );
}

const nodeTypes = { arch: ArchNode };

/* ─── nodes ───────────────────────────────────────── */
// Layout em 4 camadas horizontais, centradas num canvas de ~960px
//
//  Camada 0 (y=0):    VPS
//  Camada 1 (y=160):  Portal | API Core | Backoffice
//  Camada 1b(y=160):  App Mobile (abaixo do Portal, y=300)
//  Camada 2 (y=460):  PostgreSQL
//  Camada 3 (y=620):  R2 | Gateway | Leaflet | SMTP

const CX = { // x centers por coluna
  left:   80,   // Portal / Mobile
  center: 400,  // API / Postgres
  right:  720,  // Backoffice
};

const NODES = [
  /* ── Camada 0: Infra ── */
  {
    id: "vps",
    type: "arch",
    position: { x: CX.center, y: 0 },
    data: { label: "VPS", sub: "Ubuntu · Nginx reverse proxy", icon: "🖥", color: C.textDim, handles: ["bottom"] },
  },

  /* ── Camada 1: Frontends ── */
  {
    id: "portal",
    type: "arch",
    position: { x: CX.left, y: 160 },
    data: { label: "Portal", sub: "Next.js · App Router", icon: "🌐", color: C.green, handles: ["top","bottom","right"] },
  },
  {
    id: "api",
    type: "arch",
    position: { x: CX.center, y: 160 },
    data: { label: "API Core", sub: "Node.js · Express · Prisma", icon: "⚙️", color: C.lime, handles: ["top","bottom","left","right"] },
  },
  {
    id: "backoffice",
    type: "arch",
    position: { x: CX.right, y: 160 },
    data: { label: "Backoffice", sub: "React · Vite", icon: "🛠", color: C.orange, handles: ["top","left","bottom"] },
  },

  /* ── App Mobile: abaixo do Portal ── */
  {
    id: "mobile",
    type: "arch",
    position: { x: CX.left, y: 320 },
    data: { label: "App Mobile", sub: "React Native · WebView", icon: "📱", color: C.green, handles: ["top","right"] },
  },

  /* ── Camada 2: Banco ── */
  {
    id: "postgres",
    type: "arch",
    position: { x: CX.center, y: 460 },
    data: { label: "PostgreSQL", sub: "Relacional · Prisma ORM", icon: "🐘", color: "#336791", handles: ["top","bottom"] },
  },

  /* ── Camada 3: Serviços externos ── */
  {
    id: "r2",
    type: "arch",
    position: { x: 0, y: 640 },
    data: { label: "Cloudflare R2", sub: "Buckets · Storage", icon: "☁️", color: C.blue, handles: ["top"] },
  },
  {
    id: "gateway",
    type: "arch",
    position: { x: 240, y: 640 },
    data: { label: "Asaas / Pagar.me", sub: "Gateway de Pagamento", icon: "💳", color: C.purple, handles: ["top"] },
  },
  {
    id: "leaflet",
    type: "arch",
    position: { x: 480, y: 640 },
    data: { label: "Leaflet + Nominatim", sub: "Mapas · Geocoding (free)", icon: "🗺", color: C.greenMid, handles: ["top"] },
  },
  {
    id: "email",
    type: "arch",
    position: { x: 720, y: 640 },
    data: { label: "SMTP / Resend", sub: "E-mails transacionais", icon: "✉️", color: C.textDim, handles: ["top"] },
  },
];

const edgeBase = { animated: true, style: { strokeWidth: 1.8 } };

const EDGES = [
  /* VPS → apps */
  { id: "vps-portal", source: "vps",        target: "portal",     ...edgeBase, style: { ...edgeBase.style, stroke: C.green } },
  { id: "vps-api",    source: "vps",        target: "api",        ...edgeBase, style: { ...edgeBase.style, stroke: C.lime } },
  { id: "vps-bo",     source: "vps",        target: "backoffice", ...edgeBase, style: { ...edgeBase.style, stroke: C.orange } },

  /* Mobile ← Portal (WebView) */
  { id: "mobile-portal", source: "mobile",  target: "portal",     ...edgeBase,
    style: { ...edgeBase.style, stroke: C.green, strokeDasharray: "5 3" },
    label: "WebView", labelStyle: { fill: C.textDim, fontSize: 10 } },

  /* Portal → API */
  { id: "portal-api", source: "portal",     target: "api",        ...edgeBase,
    style: { ...edgeBase.style, stroke: C.green },
    label: "REST / JSON", labelStyle: { fill: C.textDim, fontSize: 10 } },

  /* Backoffice → API */
  { id: "bo-api",     source: "backoffice", target: "api",        ...edgeBase,
    style: { ...edgeBase.style, stroke: C.orange },
    label: "REST / JSON", labelStyle: { fill: C.textDim, fontSize: 10 } },

  /* API → PostgreSQL */
  { id: "api-pg",     source: "api",        target: "postgres",   ...edgeBase,
    style: { ...edgeBase.style, stroke: "#336791", strokeWidth: 2.2 },
    label: "Prisma ORM", labelStyle: { fill: C.textDim, fontSize: 10 } },

  /* API → serviços */
  { id: "api-r2",      source: "api", target: "r2",      ...edgeBase, style: { ...edgeBase.style, stroke: C.blue } },
  { id: "api-gateway", source: "api", target: "gateway", ...edgeBase, style: { ...edgeBase.style, stroke: C.purple } },
  { id: "api-leaflet", source: "api", target: "leaflet", ...edgeBase, style: { ...edgeBase.style, stroke: C.greenMid } },
  { id: "api-email",   source: "api", target: "email",   ...edgeBase, style: { ...edgeBase.style, stroke: C.textDim } },

  /* Portal → R2 (upload direto) */
  { id: "portal-r2",  source: "portal",     target: "r2",         ...edgeBase,
    style: { ...edgeBase.style, stroke: C.blue, strokeDasharray: "5 3" },
    label: "upload direto", labelStyle: { fill: C.textDim, fontSize: 10 } },
];

/* ─── diagram ─────────────────────────────────────── */
function Diagram() {
  const [nodes, , onNodesChange] = useNodesState(NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(EDGES);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: 780 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: C.bg, borderRadius: 16 }}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background color={C.border} gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

/* ─── export ──────────────────────────────────────── */
export function ArchDiagram() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <section className="arch-section">
      <div className="container">
        <h2 className="arch-title">Arquitetura técnica</h2>
        <p className="arch-sub">
          VPS com Nginx · Portal Next.js · API Node.js + Express + Prisma · Backoffice React ·
          PostgreSQL · Cloudflare R2 · Asaas/Pagar.me · Leaflet + Nominatim (mapas gratuitos).
        </p>
        <ReactFlowProvider>
          <Diagram />
        </ReactFlowProvider>
      </div>
    </section>
  );
}
