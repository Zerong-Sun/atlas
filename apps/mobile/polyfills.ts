// Hermes on Android lacks Intl.PluralRules; iztro/i18next expects it.
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-pluralrules/locale-data/zh";
