import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "hero.title": "Master a Skill. Transform Your Future.",
      "hero.subtitle": "Professional training in Languages, Bakery, Salon, Mechanics, AI Skills, and Exam Preparation.",
      "cta.enroll": "Enroll Now",
      "cta.browse": "Browse Courses",
      "nav.home": "Home",
      "nav.courses": "Courses",
      "nav.about": "About",
      "nav.contact": "Contact",
    },
  },
  fr: {
    translation: {
      "hero.title": "Ma\u00eetrisez une comp\u00e9tence. Transformez votre avenir.",
      "hero.subtitle": "Formation professionnelle en Langues, Boulangerie, Salon, M\u00e9canique, Comp\u00e9tences IA et Pr\u00e9paration aux examens.",
      "cta.enroll": "S'inscrire",
      "cta.browse": "Voir les cours",
      "nav.home": "Accueil",
      "nav.courses": "Cours",
      "nav.about": "\u00c0 propos",
      "nav.contact": "Contact",
    },
  },
  rw: {
    translation: {
      "hero.title": "Menya ubuhanga. Hindura ejo hawe.",
      "hero.subtitle": "Amahugurwa y'inzobere mu Ndimi, Bureri, Salon, Mekaniki, Ubuhanga bwa AI no Gutegura Ibizamini.",
      "cta.enroll": "Iyandikishe",
      "cta.browse": "Reba Amasomo",
      "nav.home": "Ahabanza",
      "nav.courses": "Amasomo",
      "nav.about": "Ibyerekeye",
      "nav.contact": "Twandikire",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: typeof window !== "undefined" ? localStorage.getItem("lang") ?? "en" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
