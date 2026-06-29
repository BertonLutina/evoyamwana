import type { Locale } from '@evoyamwana/shared';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';

export const LanguageSelector = () => {
  const { locale, localeNames, setLocale, t } = useLocale();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('common.language')}</Text>
      <View style={styles.row}>
        {(Object.keys(localeNames) as Locale[]).map((item) => (
          <Text key={item} onPress={() => setLocale(item)} style={[styles.option, locale === item && styles.active]}>
            {localeNames[item]}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  label: {
    color: colors.muted,
    fontWeight: '800'
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  option: {
    overflow: 'hidden',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.sky,
    color: colors.blue,
    fontWeight: '900'
  },
  active: {
    backgroundColor: colors.orange,
    color: colors.white
  }
});
