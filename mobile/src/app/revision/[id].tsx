import { useLocalSearchParams } from 'expo-router'

import { PlaceholderScreen } from '@/components/placeholder-screen'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <PlaceholderScreen label={`리비전: ${id}`} />
}
