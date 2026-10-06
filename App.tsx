import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SideMenu from './src/components/SideMenu';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import RegisterScreen from './src/screens/Auth/RegisterScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import OtpVerificationScreen from './src/screens/Auth/OtpVerificationScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';

import DashboardScreen from './src/screens/Dashboard/DashboardScreen';

import ChatScreen from './src/screens/Chat/ChatScreen';
import NewChatScreen from './src/screens/Chat/NewChatScreen';
import ChatHistoryScreen from './src/screens/Chat/ChatHistoryScreen';
 
import ProfileScreen from './src/screens/Profile/ProfileScreen';

import SpotifyConnectScreen from './src/screens/Spotify/SpotifyConnectScreen';
import SpotifyPlaylistsScreen from './src/screens/Spotify/SpotifyPlaylistsScreen';
import SpotifyFavoritesScreen from './src/screens/Spotify/SpotifyFavoritesScreen';

import SafePlacesScreen from './src/screens/Location/SafePlacesScreen';
import NearbyHelpScreen from './src/screens/Location/NearbyHelpScreen';
import CrisisShareScreen from './src/screens/Location/CrisisShareScreen';

import EmergencyContactsScreen from './src/screens/Contacts/EmergencyContactsScreen';
import EditContactScreen from './src/screens/Contacts/EditContactScreen';
import PersonalDataScreen from './src/screens/Profile/PersonalDataScreen';
import EditPersonalDataScreen from './src/screens/Profile/EditPersonalDataScreen';

const RootStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const HomeStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const SpotifyStack = createNativeStackNavigator();
const LocationStack = createNativeStackNavigator();
const ContactsStack = createNativeStackNavigator();

const screenOptions = { headerShown: false } as const;


const NESTED_CHAT_SCREENS = ['NewChat', 'ChatHistory'];


function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
    </HomeStack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={screenOptions}>
      <ChatStack.Screen name="Chat" component={ChatScreen} />
      <ChatStack.Screen name="NewChat" component={NewChatScreen} />
      <ChatStack.Screen name="ChatHistory" component={ChatHistoryScreen} />
    </ChatStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="PersonalData" component={PersonalDataScreen} />
      <ProfileStack.Screen name="EditPersonalData" component={EditPersonalDataScreen} />
    </ProfileStack.Navigator>
  );
}

function SpotifyStackNavigator() {
  return (
    <SpotifyStack.Navigator screenOptions={screenOptions}>
      <SpotifyStack.Screen name="SpotifyConnect" component={SpotifyConnectScreen} />
      <SpotifyStack.Screen name="SpotifyPlaylists" component={SpotifyPlaylistsScreen} />
      <SpotifyStack.Screen name="SpotifyFavorites" component={SpotifyFavoritesScreen} />
    </SpotifyStack.Navigator>
  );
}

function LocationStackNavigator() {
  return (
    <LocationStack.Navigator screenOptions={screenOptions}>
      <LocationStack.Screen name="SafePlaces" component={SafePlacesScreen} />
      <LocationStack.Screen name="NearbyHelp" component={NearbyHelpScreen} />
      <LocationStack.Screen name="CrisisShare" component={CrisisShareScreen} />
    </LocationStack.Navigator>
  );
}

function ContactsStackNavigator() {
  return (
    <ContactsStack.Navigator screenOptions={screenOptions}>
      <ContactsStack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <ContactsStack.Screen name="EditContact" component={EditContactScreen} />
    </ContactsStack.Navigator>
  );
}


function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerType: 'front' }}
      drawerContent={(props) => (
        <SideMenu
          activeKey={props.state.routeNames[props.state.index]}
          onNavigate={(key) => {
            if (NESTED_CHAT_SCREENS.includes(key)) {
              props.navigation.navigate('Chat', { screen: key });
            } else {
              props.navigation.navigate(key);
            }
          }}
          onClose={() => props.navigation.closeDrawer()}
        />
      )}
    >
      <Drawer.Screen name="Home" component={HomeStackNavigator} />
      <Drawer.Screen name="Chat" component={ChatStackNavigator} />
      <Drawer.Screen name="Profile" component={ProfileStackNavigator} />
      <Drawer.Screen name="Spotify" component={SpotifyStackNavigator} />
      <Drawer.Screen name="Location" component={LocationStackNavigator} />
      <Drawer.Screen name="Contacts" component={ContactsStackNavigator} />
    </Drawer.Navigator>
  );
}


function LoadingGate() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDF7FF' }}>
      <ActivityIndicator size="large" color="#7868A6" />
    </View>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingGate />;
  }

  return (
    <RootStack.Navigator
      screenOptions={screenOptions}
      initialRouteName={isAuthenticated ? 'App' : 'Login'}
    >
      <RootStack.Screen name="Register" component={RegisterScreen} />
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <RootStack.Screen name="App" component={AppDrawer} />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FDF7FF" />
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
