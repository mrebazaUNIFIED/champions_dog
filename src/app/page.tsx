'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiAlertTriangle, FiShield, FiUserCheck, FiUsers } from 'react-icons/fi';
import { Button } from '../components/common/Button';
import { Card, CardTitle } from '../components/common/Card';
import { checkFeasibility } from '../lib/algorithms/teamValidation';
import { useConfigStore } from '../store/useConfigStore';
import { usePlayersStore } from '../store/usePlayersStore';

export default function DashboardPage() {
  const players = usePlayersStore((s) => s.players);
  const config = useConfigStore((s) => s.config);

  const available = players.filter((p) => p.available);
  const feasibility = checkFeasibility(players, config.formation, config.numberOfTeams);

  const stats = [
    { label: 'Jugadores registrados', value: players.length, icon: FiUsers },
    { label: 'Jugadores disponibles', value: available.length, icon: FiUserCheck },
    { label: 'Equipos a formar', value: config.numberOfTeams, icon: FiShield },
  ];

  return (
    <div className="space-y-6">
      <div className="panel-dark relative overflow-hidden p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-gold-500/10 blur-[90px]" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20">
            <Image src="/logo.jpg" alt="Perros Locos" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">4.º Edición</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Campeonato Perritos Locos
            </h2>
            <p className="mt-1 text-sm text-white/60">Selección de Equipos</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 text-xl text-brand-600">
              <s.icon />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-ink-900">{s.value}</p>
              <p className="text-sm text-ink-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                feasibility.ok ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {feasibility.ok ? <FiCheckCircle /> : <FiAlertTriangle />}
            </span>
            <div>
              <CardTitle>{feasibility.ok ? 'Campeonato listo para generar equipos' : 'Faltan jugadores para generar los equipos'}</CardTitle>
              <p className="mt-1 text-sm text-ink-500">
                {feasibility.ok
                  ? `Hay ${feasibility.totalAvailable} jugadores disponibles para las ${feasibility.totalNeeded} plazas requeridas.`
                  : feasibility.message}
              </p>
              {!feasibility.ok && feasibility.shortages.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {feasibility.shortages.map((s) => (
                    <li key={s.position}>
                      · Faltan jugadores de {s.position}: hay {s.eligibleAvailable}, se necesitan {s.needed}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <Link href="/seleccion">
            <Button>
              Ir a generar selección <FiArrowRight />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
