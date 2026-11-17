import type { IconType } from 'react-icons';
import {
  FiBarChart2,
  FiCheckSquare,
  FiClipboard,
  FiSettings,
  FiClock,
  FiShield,
  FiHome,
  FiUsers,
} from 'react-icons/fi';

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  group: string;
}

export const NAV_GROUPS = ['Gestión', 'Competencia', 'Sistema'] as const;

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: FiHome, group: 'Gestión' },
  { href: '/jugadores', label: 'Jugadores', icon: FiUsers, group: 'Gestión' },
  { href: '/votacion', label: 'Votación de niveles', icon: FiCheckSquare, group: 'Gestión' },
  { href: '/campeonato', label: 'Configuración del campeonato', icon: FiShield, group: 'Competencia' },
  { href: '/seleccion', label: 'Selección de equipos', icon: FiClipboard, group: 'Competencia' },
  { href: '/comparacion', label: 'Comparación de equipos', icon: FiBarChart2, group: 'Competencia' },
  { href: '/historial', label: 'Historial', icon: FiClock, group: 'Competencia' },
  { href: '/configuracion', label: 'Configuración', icon: FiSettings, group: 'Sistema' },
];
