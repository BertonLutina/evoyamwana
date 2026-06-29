import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import logo from '../../assets/evoyamwana-logo.png';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { Screen } from '../components/Screen';
import { ErrorMessage } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';
import type { AuthStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterSchool'>;

export const RegisterSchoolScreen = ({ navigation }: Props) => {
  const { registerSchool } = useAuth();
  const { t } = useLocale();
  const [values, setValues] = useState({
    schoolName: '',
    country: '',
    city: '',
    schoolEmail: '',
    schoolPhone: '',
    ownerFullName: '',
    ownerEmail: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await registerSchool({ ...values, schoolPhone: values.schoolPhone || undefined });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to register school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.brand}>EVOYAMWANA</Text>
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Crée l’école et son premier administrateur via l’API partagée.</Text>
      <AppTextInput label="Nom de l’école" value={values.schoolName} onChangeText={(text) => update('schoolName', text)} />
      <AppTextInput label="Country" value={values.country} onChangeText={(text) => update('country', text)} />
      <AppTextInput label="City" value={values.city} onChangeText={(text) => update('city', text)} />
      <AppTextInput label="Email de l’école" autoCapitalize="none" value={values.schoolEmail} onChangeText={(text) => update('schoolEmail', text)} />
      <AppTextInput label="Téléphone de l’école" value={values.schoolPhone} onChangeText={(text) => update('schoolPhone', text)} />
      <AppTextInput label="Owner full name" value={values.ownerFullName} onChangeText={(text) => update('ownerFullName', text)} />
      <AppTextInput label="Email du responsable" autoCapitalize="none" value={values.ownerEmail} onChangeText={(text) => update('ownerEmail', text)} />
      <AppTextInput label={t('auth.password')} secureTextEntry value={values.password} onChangeText={(text) => update('password', text)} />
      <ErrorMessage message={error} />
      <AppButton title={t('auth.createWorkspace')} loading={loading} onPress={submit} />
      <AppButton title={t('auth.signIn')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 16
  },
  headerText: {
    flex: 1
  },
  brand: {
    color: colors.orange,
    fontWeight: '900',
    letterSpacing: 1.4
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 22
  }
});
