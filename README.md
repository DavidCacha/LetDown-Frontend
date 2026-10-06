# LetDown (React Native CLI + TypeScript)

Proyecto generado a partir del archivo de Figma **LetDown**
(`TZGiQmzzljMDZvdeuJGvgu`), respetando textos, colores, tipografía y
estructura tal como están definidos en el diseño.

## Stack
- React Native CLI + TypeScript
- Estilos con `StyleSheet` nativo (sin librerías de CSS)
- Iconos: `react-native-vector-icons` (Feather) — placeholders 1:1 por
  significado mientras conectas los SVG reales exportados de Figma
- Navegación: **no incluida a propósito** (la vas a montar tú). Las
  screens reciben `navigation`/`route` como props y usan
  `navigation.navigate('Nombre')`, `navigation.goBack()`,
  `navigation.openDrawer()` — cualquier navegador (Stack/Drawer de
  React Navigation) encaja sin tocar el código de las screens.

## Estructura
```
src/
  assets/            # imágenes e íconos (logo placeholder incluido)
  components/        # UI reutilizable (Button, TextField, Chip, TopBar,
                      # AppHeader, BottomNav, SideMenu, CrisisPanel, ChatBubble...)
  constants/theme.ts # colores, tipografía, espaciados y sombras extraídos del Figma
  screens/
    Auth/            # Register, Login, OtpVerification
    Dashboard/        # Home / Dashboard
    Chat/            # Chat con IA, Historial de chats
    ...
```

## Progreso (17/17 pantallas del Figma completas)
Todas construidas con los textos, colores y estructura reales del archivo de Figma:
1. Registro — `screens/Auth/RegisterScreen.tsx`
2. Inicio de Sesión — `screens/Auth/LoginScreen.tsx`
3. Validación de Cuenta (OTP) — `screens/Auth/OtpVerificationScreen.tsx`
4. Menú Hamburguesa → componente `SideMenu` (drawer) + `AppHeader` + `BottomNav`,
   reutilizable en todas las screens (no es una screen aparte, se monta en el navigator)
5. Inicio / Dashboard — `screens/Dashboard/DashboardScreen.tsx`
6. Chat con IA — `screens/Chat/ChatScreen.tsx`
7. Historial de Chats — `screens/Chat/ChatHistoryScreen.tsx`
8. Nuevo Chat — `screens/Chat/NewChatScreen.tsx`
9. Perfil y Configuración — `screens/Profile/ProfileScreen.tsx`
10. Spotify — Vincular cuenta — `screens/Spotify/SpotifyConnectScreen.tsx`
11. Spotify — Recomendaciones y Playlists — `screens/Spotify/SpotifyPlaylistsScreen.tsx`
12. Spotify — Favoritos e Historial — `screens/Spotify/SpotifyFavoritesScreen.tsx`
13. Ubicación Segura — Lugares Seguros — `screens/Location/SafePlacesScreen.tsx`
14. Ubicación Segura — Buscar Ayuda Cercana — `screens/Location/NearbyHelpScreen.tsx`
15. Ubicación Segura — Compartir en Crisis — `screens/Location/CrisisShareScreen.tsx`
16. Agregar o Editar Contacto — `screens/Contacts/EditContactScreen.tsx`
17. Contactos de Emergencia — `screens/Contacts/EmergencyContactsScreen.tsx`

## Pendiente de tu lado (navegación)
Sugerencia de árbol de navegación (React Navigation, Stack + Drawer):
```
Drawer (contenido: <SideMenu />)
  Stack "Home" → DashboardScreen
  Stack "Chat" → ChatScreen, NewChatScreen, ChatHistoryScreen
  Stack "Profile" → ProfileScreen
  Stack "Spotify" → SpotifyConnectScreen, SpotifyPlaylistsScreen, SpotifyFavoritesScreen
  Stack "Location" → SafePlacesScreen, NearbyHelpScreen, CrisisShareScreen
  Stack "Contacts" → EmergencyContactsScreen, EditContactScreen
Stack raíz (sin drawer) → RegisterScreen, LoginScreen, OtpVerificationScreen
```
Las screens con `EditContact` esperan `route.params.contactId` opcional (si viene,
es modo edición y se muestra el botón "Eliminar").

## Notas importantes
- **Iconos/imágenes**: Figma expone los assets como URLs temporales
  (expiran a los 7 días). Sustituye los íconos `Feather` por los SVG
  reales cuando los exportes desde Figma, y reemplaza
  `src/assets/images/sanctuary-logo.png` por el logo real.
- **Navegación**: cada pantalla asume que recibe `navigation` (y
  `route` cuando aplica) vía props — estándar de React Navigation.
- **Instalación**: `npm install`, luego `npx pod-install` en iOS.
