'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  NotificationItem,
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/lib/notifications';

interface NotificationsMenuProps {
  account: string | null;
}

export default function NotificationsMenu({ account }: NotificationsMenuProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (account) {
      setReadIds(getReadNotificationIds(account));
    } else {
      setReadIds([]);
    }
  }, [account]);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      if (!account) {
        if (isMounted) setNotifications([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/notifications?account=${account}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.error('Error al cargar notificaciones:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [account]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!account) return null;

  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = (id: string) => {
    if (!account) return;
    markNotificationAsRead(account, id);
    setReadIds(getReadNotificationIds(account));
  };

  const handleMarkAllAsRead = () => {
    if (!account) return;
    const allIds = notifications.map(n => n.id);
    markAllNotificationsAsRead(account, allIds);
    setReadIds(getReadNotificationIds(account));
  };

  const getTypeStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'UNANIMOUS_EXECUTION':
        return {
          badge: 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: '⚡'
        };
      case 'VOTING_FINISHED':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '🗳️'
        };
      case 'PROPOSAL_CREATED':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: '🛡️'
        };
      case 'SECOND_PERIOD':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '⚖️'
        };
      case 'PROPOSAL_REJECTED':
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '❌'
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: '🔔'
        };
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Botón Campana de Notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 text-slate-200 hover:text-white transition-all duration-300 shadow-md flex items-center justify-center group"
        title="Menú de Notificaciones DAO"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-pink-500 to-purple-600 border border-slate-950 font-black text-[10px] text-white items-center justify-center shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Menú Desplegable / Modal de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-slate-950/95 border border-purple-500/30 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden space-y-0">
          
          {/* Header del Menú */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-purple-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="font-extrabold text-sm text-white">Notificaciones DAO</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <div className="w-5 h-5 mx-auto mb-2 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
                Cargando notificaciones de gobernanza...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="text-3xl">📭</div>
                <div className="text-xs font-bold text-slate-300">No hay notificaciones aún</div>
                <div className="text-[11px] text-slate-500">
                  Recibirás alertas cuando finalicen las votaciones de las propuestas.
                </div>
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = readIds.includes(n.id);
                const style = getTypeStyle(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id)}
                    className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                      isRead ? 'bg-slate-950/40 opacity-70 hover:opacity-100 hover:bg-slate-900/60' : 'bg-purple-950/20 hover:bg-purple-950/40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${style.badge}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1" title="Sin leer" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                      <div className="flex items-center justify-between pt-1">
                        <Link
                          href="/dashboard/proposals"
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Ver Propuestas →
                        </Link>
                        <span className="text-[10px] text-slate-500">
                          {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : 'Reciente'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer del Menú */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-center">
            <Link
              href="/dashboard/proposals"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors block"
            >
              Ir al Centro de Propuestas & Votación ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
