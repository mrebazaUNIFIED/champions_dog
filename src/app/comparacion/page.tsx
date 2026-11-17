'use client';

import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiArrowDown, FiArrowUp, FiBarChart2 } from 'react-icons/fi';
import { Card, CardTitle } from '../../components/common/Card';
import { useSelectionStore } from '../../store/useSelectionStore';
import { POSITIONS, POSITION_LABELS, SKILL_LEVELS } from '../../types';

export default function ComparacionPage() {
  const { current, loaded, loadCurrent } = useSelectionStore();

  useEffect(() => {
    if (!loaded) void loadCurrent();
  }, [loaded, loadCurrent]);

  if (!current) {
    return (
      <Card className="text-center text-sm text-ink-400">
        Generá primero una selección de equipos en la sección &quot;Selección de equipos&quot;.
      </Card>
    );
  }

  const teamsById = Object.fromEntries(current.teams.map((t) => [t.id, t]));
  const scoreData = current.stats.map((s) => ({
    name: teamsById[s.teamId]?.name ?? s.teamId,
    Puntaje: s.totalScore,
    Promedio: Number(s.averageScore.toFixed(2)),
    color: teamsById[s.teamId]?.color ?? '#16a34a',
  }));

  const positionData = POSITIONS.map((position) => {
    const row: Record<string, number | string> = { posicion: POSITION_LABELS[position] };
    current.stats.forEach((s) => {
      row[teamsById[s.teamId]?.name ?? s.teamId] = s.positionCounts[position];
    });
    return row;
  });

  const levelData = SKILL_LEVELS.map((level) => {
    const row: Record<string, number | string> = { nivel: `Nivel ${level}` };
    current.stats.forEach((s) => {
      row[teamsById[s.teamId]?.name ?? s.teamId] = s.levelDistribution[level];
    });
    return row;
  });

  const strongest = teamsById[current.strongestTeamId];
  const weakest = teamsById[current.weakestTeamId];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Comparación de equipos</h2>
        <p className="text-sm text-ink-500">¿Qué tan equilibrada quedó la selección generada?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <FiArrowUp className="text-xl text-green-600" />
          <div>
            <p className="text-sm text-ink-500">Equipo más fuerte</p>
            <p className="font-display font-bold text-ink-900">{strongest?.name}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <FiArrowDown className="text-xl text-red-500" />
          <div>
            <p className="text-sm text-ink-500">Equipo más débil</p>
            <p className="font-display font-bold text-ink-900">{weakest?.name}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <FiBarChart2 className="text-xl text-brand-600" />
          <div>
            <p className="text-sm text-ink-500">Diferencia de puntaje</p>
            <p className="font-display font-bold text-ink-900">{current.maxDiff} pts</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Puntaje total por equipo</CardTitle>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
              <XAxis dataKey="name" stroke="#8a909c" fontSize={12} />
              <YAxis stroke="#8a909c" fontSize={12} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #dfe3e8', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="Puntaje" radius={[6, 6, 0, 0]}>
                {scoreData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Distribución por posición</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
                <XAxis dataKey="posicion" stroke="#8a909c" fontSize={11} />
                <YAxis stroke="#8a909c" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #dfe3e8', borderRadius: 8 }} />
                <Legend />
                {current.teams.map((t) => (
                  <Bar key={t.id} dataKey={t.name} stackId="pos" fill={t.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Distribución por nivel</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
                <XAxis dataKey="nivel" stroke="#8a909c" fontSize={11} />
                <YAxis stroke="#8a909c" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #dfe3e8', borderRadius: 8 }} />
                <Legend />
                {current.teams.map((t) => (
                  <Bar key={t.id} dataKey={t.name} stackId="lvl" fill={t.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <CardTitle>Tabla de puntuaciones</CardTitle>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">Equipo</th>
              <th className="py-2">Puntaje total</th>
              <th className="py-2">Promedio</th>
              <th className="py-2">Arqueros</th>
              <th className="py-2">Defensas</th>
              <th className="py-2">Mediocampistas</th>
              <th className="py-2">Delanteros</th>
            </tr>
          </thead>
          <tbody>
            {current.stats.map((s) => (
              <tr key={s.teamId} className="border-b border-surface-200">
                <td className="py-2 font-medium text-ink-900">{teamsById[s.teamId]?.name}</td>
                <td className="py-2 text-ink-700">{s.totalScore}</td>
                <td className="py-2 text-ink-700">{s.averageScore.toFixed(1)}</td>
                <td className="py-2 text-ink-700">{s.positionCounts.arquero}</td>
                <td className="py-2 text-ink-700">{s.positionCounts.defensa}</td>
                <td className="py-2 text-ink-700">{s.positionCounts.mediocampista}</td>
                <td className="py-2 text-ink-700">{s.positionCounts.delantero}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
