// Flujo de costo mínimo / flujo máximo (SPFA, caminos de aumento sucesivos).
// Uso interno: grafos pequeños (decenas de nodos) — prioriza claridad sobre rendimiento asintótico.

interface Edge {
  to: number;
  cap: number;
  cost: number;
  flow: number;
}

export class MinCostMaxFlow {
  private edges: Edge[] = [];
  private graph: number[][];

  constructor(private nodeCount: number) {
    this.graph = Array.from({ length: nodeCount }, () => []);
  }

  addEdge(from: number, to: number, cap: number, cost: number) {
    this.graph[from].push(this.edges.length);
    this.edges.push({ to, cap, cost, flow: 0 });
    this.graph[to].push(this.edges.length);
    this.edges.push({ to: from, cap: 0, cost: -cost, flow: 0 });
  }

  /** Corre caminos de aumento de costo mínimo sucesivos. Devuelve { flow, cost }. */
  run(source: number, sink: number): { flow: number; cost: number } {
    let totalFlow = 0;
    let totalCost = 0;

    for (;;) {
      const dist = new Array(this.nodeCount).fill(Infinity);
      const inQueue = new Array(this.nodeCount).fill(false);
      const prevEdge = new Array(this.nodeCount).fill(-1);
      dist[source] = 0;
      const queue = [source];
      inQueue[source] = true;

      while (queue.length) {
        const u = queue.shift() as number;
        inQueue[u] = false;
        for (const edgeIdx of this.graph[u]) {
          const edge = this.edges[edgeIdx];
          if (edge.cap - edge.flow <= 0) continue;
          const v = edge.to;
          if (dist[u] + edge.cost < dist[v]) {
            dist[v] = dist[u] + edge.cost;
            prevEdge[v] = edgeIdx;
            if (!inQueue[v]) {
              queue.push(v);
              inQueue[v] = true;
            }
          }
        }
      }

      if (dist[sink] === Infinity) break;

      let aug = Infinity;
      let v = sink;
      while (v !== source) {
        const edgeIdx = prevEdge[v];
        const edge = this.edges[edgeIdx];
        aug = Math.min(aug, edge.cap - edge.flow);
        v = this.edges[edgeIdx ^ 1].to;
      }

      v = sink;
      while (v !== source) {
        const edgeIdx = prevEdge[v];
        this.edges[edgeIdx].flow += aug;
        this.edges[edgeIdx ^ 1].flow -= aug;
        v = this.edges[edgeIdx ^ 1].to;
      }

      totalFlow += aug;
      totalCost += aug * dist[sink];
    }

    return { flow: totalFlow, cost: totalCost };
  }

  flowOn(from: number, to: number): number {
    for (const idx of this.graph[from]) {
      const e = this.edges[idx];
      if (e.to === to && e.cap > 0) return e.flow;
    }
    return 0;
  }
}
