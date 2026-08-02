import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useColorScheme } from 'react-native'

import { wikiTheme } from '@/theme/colors'

export default function TabsLayout() {
  const theme = wikiTheme(useColorScheme())

  return (
    <NativeTabs
      backgroundColor={theme.surface}
      tintColor={theme.accentText}
      labelStyle={{ selected: { color: theme.accentText } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>검색</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookmarks">
        <NativeTabs.Trigger.Label>북마크</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bookmark.fill" md="bookmark" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>더보기</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis" md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
