'use client';

import { useRouter } from 'next/navigation';
import Options from '@/Components/MainMenuStack/Options/Options';
import { useUserData } from '@/lib/context/UserDataProvider';
import { updateProfileOptions } from '@/api/worldSave';
import { ROUTES } from '@/lib/routes';

export default function OptionsPage() {
  const { selectedProfile, userData, updateUserData } = useUserData();
  const router = useRouter();

  const currentProfile =
    userData?.find((p) => p.id === selectedProfile?.id) || selectedProfile;

  const handleUpdateOptions = (optionsPatch) => {
    if (!selectedProfile?.id || !userData || !updateUserData) {
      return;
    }
    const updated = updateProfileOptions(userData, selectedProfile.id, optionsPatch);
    updateUserData(updated);
  };

  return (
    <Options
      navigateToMenu={() => router.push(ROUTES.mainMenu)}
      selectedProfile={currentProfile}
      onUpdateOptions={handleUpdateOptions}
    />
  );
}