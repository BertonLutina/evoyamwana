import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import logo from '../../assets/evoyamwana-logo.png';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { ErrorMessage } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';
import type { AuthStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState('admin@demo.evoya.test');
  const [password, setPassword] = useState('DemoPass123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.brand}>EVOYAMWANA</Text>
        </View>
        <Text style={styles.title}>{t('auth.loginTitle')}</Text>
        <Text style={styles.subtitle}>{t('mobile.connected')}</Text>
      </View>
      <AppTextInput label={t('auth.email')} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <AppTextInput label={t('auth.password')} secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorMessage message={error} />
      <AppButton title={t('auth.signIn')} loading={loading} onPress={handleLogin} />
      <AppButton title={t('auth.registerSchool')} variant="ghost" onPress={() => navigation.navigate('RegisterSchool')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.blue,
    borderRadius: 24,
    padding: 22,
    gap: 10
  },
  brand: {
    color: colors.orange,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.white
  },
  title: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900'
  },
  subtitle: {
    color: '#dbeafe',
    lineHeight: 22
  }
});
