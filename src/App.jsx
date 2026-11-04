import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Code-split routes for instant initial load and high Lighthouse scores
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const PhilosophyPage = lazy(() => import('./features/philosophy/PhilosophyPage'));
const BooksPage = lazy(() => import('./features/books/BooksPage'));
const PedometerPage = lazy(() => import('./features/pedometer/PedometerPage'));
const HabitsPage = lazy(() => import('./features/habits/HabitsPage'));
const SchedulePage = lazy(() => import('./features/schedule/SchedulePage'));
const ExpensesPage = lazy(() => import('./features/expenses/ExpensesPage'));
const CharacterPage = lazy(() => import('./features/character/CharacterPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const AccountPage = lazy(() => import('./features/auth/AccountPage'));

function RouteLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={
            <Suspense fallback={<RouteLoader />}>
              <DashboardPage />
            </Suspense>
          } />
          <Route path="philosophy" element={
            <Suspense fallback={<RouteLoader />}>
              <PhilosophyPage />
            </Suspense>
          } />
          <Route path="books" element={
            <Suspense fallback={<RouteLoader />}>
              <BooksPage />
            </Suspense>
          } />
          <Route path="steps" element={
            <Suspense fallback={<RouteLoader />}>
              <PedometerPage />
            </Suspense>
          } />
          <Route path="habits" element={
            <Suspense fallback={<RouteLoader />}>
              <HabitsPage />
            </Suspense>
          } />
          <Route path="schedule" element={
            <Suspense fallback={<RouteLoader />}>
              <SchedulePage />
            </Suspense>
          } />
          <Route path="expenses" element={
            <Suspense fallback={<RouteLoader />}>
              <ExpensesPage />
            </Suspense>
          } />
          <Route path="character" element={
            <Suspense fallback={<RouteLoader />}>
              <CharacterPage />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<RouteLoader />}>
              <SettingsPage />
            </Suspense>
          } />
          <Route path="account" element={
            <Suspense fallback={<RouteLoader />}>
              <AccountPage />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
