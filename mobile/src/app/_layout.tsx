import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'

import { WikiColors } from '@/theme/colors'

const WikiLightNav = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: WikiColors.light.accent,
    background: WikiColors.light.bg,
    card: WikiColors.light.headerBg,
    text: WikiColors.light.headerText,
    border: WikiColors.light.border,
  },
}

const WikiDarkNav = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: WikiColors.dark.accent,
    background: WikiColors.dark.bg,
    card: WikiColors.dark.headerBg,
    text: WikiColors.dark.headerText,
    border: WikiColors.dark.border,
  },
}

export default function RootLayout() {
  const scheme = useColorScheme()
  const theme = scheme === 'dark' ? WikiColors.dark : WikiColors.light

  return (
    <ThemeProvider value={scheme === 'dark' ? WikiDarkNav : WikiLightNav}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.headerText,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="w/[slug]" options={{ title: '' }} />
        <Stack.Screen name="history/[slug]" options={{ title: '문서 역사' }} />
        <Stack.Screen name="revision/[id]" options={{ title: '리비전' }} />
        <Stack.Screen name="diff" options={{ title: '비교' }} />
        <Stack.Screen name="faq" options={{ title: '자주 묻는 질문' }} />
      </Stack>
    </ThemeProvider>
  )
}
