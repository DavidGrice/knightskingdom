'use client';

import dynamic from 'next/dynamic';
import LoadingComponent from '@/Components/Common/LoadingComponent/LoadingComponent';

const screenLoading = () => <LoadingComponent isLoading />;

export const LazyMainGameScreen = dynamic(
  () => import('@/Components/MainMenuStack/StartStack/MainGameStack/screens/MainGameScreen'),
  { ssr: false, loading: screenLoading },
);

export const LazyWorkshopScreen = dynamic(
  () => import('@/Components/MainMenuStack/StartStack/MainGameStack/screens/WorkshopScreen'),
  { ssr: false, loading: screenLoading },
);

export const LazySnapshotScreen = dynamic(
  () => import('@/Components/MainMenuStack/StartStack/MainGameStack/screens/SnapshotScreen'),
  { ssr: false, loading: screenLoading },
);

export const LazyMyModelsScreen = dynamic(
  () => import('@/Components/MainMenuStack/StartStack/MainGameStack/screens/MyModelsScreen'),
  { ssr: false, loading: screenLoading },
);