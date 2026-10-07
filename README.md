# LetDown 📱

LetDown is a mobile application focused on emotional support and user well-being.

The application provides a simple and accessible experience where users can interact through chat, manage their profile, access support resources, and connect their Spotify account.

> 🚧 This project is currently under development.

---

## 📱 Features

- User registration and login
- OTP verification
- Form validation
- Secure password validation
- Dashboard
- Emotional support chat
- New chat conversations
- Chat history
- User profile
- Spotify integration
- Spotify playlists
- Favorite songs
- Crisis support section
- Side navigation menu
- Responsive mobile interface

---

## 🛠️ Technologies

- React Native
- TypeScript
- JavaScript
- React Navigation
- React Native CLI
- React Native Vector Icons
- React Native Reanimated
- React Native Gesture Handler
- Android
- iOS
- Git
- GitHub

---
📸 Screenshots
Screenshots of the application will be added as development progresses.

Login

<img width="270" height="640" alt="login" src="https://github.com/user-attachments/assets/d128db93-5adb-4a36-a140-32e476ba8db2" />

Restablecer contraseña

<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 50 PM" src="https://github.com/user-attachments/assets/84c66f47-96e1-4253-adde-39be822b529f" />

Chat con AI

<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(2)" src="https://github.com/user-attachments/assets/224ba171-5ac7-49ab-9d24-4d417e72df29" />
<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(3)" src="https://github.com/user-attachments/assets/7366a136-0cdf-44e7-9ca5-57f3afa0bbf8" />

Historial de chats
<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(4)" src="https://github.com/user-attachments/assets/0388a361-62e5-4a95-ba87-d80c79caf57b" />

Perfil y escaneo de datos de INE
<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(5)" src="https://github.com/user-attachments/assets/cfa271ad-0f5f-4741-9481-f82d9ce89132" />

Musica emotiva - Integracion con Spotify
<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(6)" src="https://github.com/user-attachments/assets/9c6f5b84-b5b9-44b2-9ff2-9fd1a17bbb45" />

Localizacion segura
<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(7)" src="https://github.com/user-attachments/assets/baa6dafb-6c52-455a-bd3d-2fa95af1ec27" />

Contacts
<img  width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 51 PM(7)" src="https://github.com/user-attachments/assets/f163bdf3-9c65-4751-9e85-a861e23058b4" />


Dashboard

<img width="270" height="640" alt="WhatsApp Image 2026-10-06 at 7 55 50 PM" src="https://github.com/user-attachments/assets/c644816c-ffee-4c6c-af2b-41799d58ac5c" />

---
## 📂 Project Structure

```text
src/
├── components/
│   ├── AppHeader
│   ├── Chip
│   ├── CrisisPanel
│   ├── PrimaryButton
│   ├── SideMenu
│   ├── TextField
│   └── TopBar
│
├── screens/
│   ├── auth/
│   │   ├── LoginScreen
│   │   ├── RegisterScreen
│   │   └── OtpVerificationScreen
│   │
│   ├── chat/
│   │   ├── ChatScreen
│   │   ├── NewChatScreen
│   │   └── ChatHistoryScreen
│   │
│   ├── dashboard/
│   │   └── DashboardScreen
│   │
│   ├── profile/
│   │   └── ProfileScreen
│   │
│   └── spotify/
│       ├── SpotifyConnectScreen
│       ├── SpotifyPlaylistsScreen
│       └── SpotifyFavoritesScreen
│
└── navigation/

🚀 Installation
Clone the repository:
git clone https://github.com/YOUR_USERNAME/LetDown-Frontend.git

Enter the project directory:
cd LetDown-Frontend

Install dependencies:
npm install

Android
npm run android

iOS
Install CocoaPods dependencies:
cd ios
pod install
cd ..

Then run:
npm run ios

🔐 Environment Variables
Create a .env file in the root directory if required:
API_URL=your_api_url
SPOTIFY_CLIENT_ID=your_spotify_client_id

Never commit API keys, tokens, passwords, or other credentials to the repository.

🧩 Architecture
The application follows a component-based architecture using reusable React Native components.
The project separates:
- Screens
- Reusable UI components
- Navigation
- Authentication flows
- External service integrations
- Application state
This approach improves maintainability, scalability, and code reuse.

🗺️ Roadmap
- [x] Authentication UI
- [x] Login validation
- [x] Registration
- [x] Dashboard
- [x] Chat interface
- [x] Profile
- [x] Spotify screens
- [x] Backend integration
- [x] Complete Spotify API integration
- [x] Biometric authentication
- [x] Push notifications
- [x] Automated testing
- [x] Production release
👨‍💻 Author
David Casanova
Frontend / Mobile Developer
Technologies: React, React Native, TypeScript and JavaScript.
