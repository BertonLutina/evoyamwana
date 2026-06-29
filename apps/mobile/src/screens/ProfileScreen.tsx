import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { LanguageSelector } from '../components/LanguageSelector';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.slice(0, 1) ?? 'E'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName ?? 'EVOYAMWANA User'}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>
      <View style={styles.card}>
        <LanguageSelector />
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Security</Text>
        <Text style={styles.meta}>JWT access token is stored with Expo SecureStore and attached to API requests with Axios.</Text>
      </View>
      <AppButton title="Sign out" variant="secondary" onPress={() => void logout()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '900'
  },
  name: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900'
  },
  meta: {
    color: colors.muted,
    lineHeight: 21
  },
  role: {
    alignSelf: 'flex-start',
    marginTop: 4,
    color: colors.orange,
    fontWeight: '900'
  },
  section: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 18
  }
});
