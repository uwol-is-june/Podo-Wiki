import { useLocalSearchParams } from 'expo-router'

import { PlaceholderScreen } from '@/components/placeholder-screen'

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  return <PlaceholderScreen label={`역사: ${slug}`} />
}
