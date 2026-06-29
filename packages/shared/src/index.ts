export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'DIRECTOR'
  | 'SECRETARY'
  | 'ACCOUNTANT'
  | 'TEACHER'
  | 'CLASS_TUTOR'
  | 'PARENT'
  | 'STUDENT'
  | 'DISCIPLINE_OFFICER'
  | 'LIBRARIAN'
  | 'NURSE'
  | 'TRANSPORT_MANAGER'
  | 'CANTEEN_MANAGER';
export type Locale = 'fr' | 'sw' | 'ln' | 'lua' | 'kg' | 'tll';
export type SchoolType =
  | 'creche'
  | 'maternelle'
  | 'primary'
  | 'secondary'
  | 'secondary_general'
  | 'secondary_technical'
  | 'training_center'
  | 'haute_ecole'
  | 'university'
  | 'primary_secondary'
  | 'mixed';
export type StudentCategory =
  | 'creche'
  | 'maternelle'
  | 'primaire'
  | 'secondaire'
  | 'secondaire_general'
  | 'secondaire_technique'
  | 'formation'
  | 'haute_ecole'
  | 'universite'
  | 'mixte';
export type SchoolStatus = 'private' | 'public' | 'faith_based' | 'community';

export const africanCountries = [
  { name: 'Afrique du Sud', flag: '🇿🇦' },
  { name: 'Algérie', flag: '🇩🇿' },
  { name: 'Angola', flag: '🇦🇴' },
  { name: 'Bénin', flag: '🇧🇯' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'Burkina Faso', flag: '🇧🇫' },
  { name: 'Burundi', flag: '🇧🇮' },
  { name: 'Cabo Verde', flag: '🇨🇻' },
  { name: 'Cameroun', flag: '🇨🇲' },
  { name: 'Comores', flag: '🇰🇲' },
  { name: 'Congo', flag: '🇨🇬' },
  { name: 'Côte d’Ivoire', flag: '🇨🇮' },
  { name: 'Djibouti', flag: '🇩🇯' },
  { name: 'Égypte', flag: '🇪🇬' },
  { name: 'Érythrée', flag: '🇪🇷' },
  { name: 'Eswatini', flag: '🇸🇿' },
  { name: 'Éthiopie', flag: '🇪🇹' },
  { name: 'Gabon', flag: '🇬🇦' },
  { name: 'Gambie', flag: '🇬🇲' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Guinée', flag: '🇬🇳' },
  { name: 'Guinée-Bissau', flag: '🇬🇼' },
  { name: 'Guinée équatoriale', flag: '🇬🇶' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'Liberia', flag: '🇱🇷' },
  { name: 'Libye', flag: '🇱🇾' },
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Malawi', flag: '🇲🇼' },
  { name: 'Mali', flag: '🇲🇱' },
  { name: 'Maroc', flag: '🇲🇦' },
  { name: 'Maurice', flag: '🇲🇺' },
  { name: 'Mauritanie', flag: '🇲🇷' },
  { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'Namibie', flag: '🇳🇦' },
  { name: 'Niger', flag: '🇳🇪' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'Ouganda', flag: '🇺🇬' },
  { name: 'République centrafricaine', flag: '🇨🇫' },
  { name: 'République démocratique du Congo', flag: '🇨🇩' },
  { name: 'Rwanda', flag: '🇷🇼' },
  { name: 'Sahara occidental', flag: '🇪🇭' },
  { name: 'Sao Tomé-et-Principe', flag: '🇸🇹' },
  { name: 'Sénégal', flag: '🇸🇳' },
  { name: 'Seychelles', flag: '🇸🇨' },
  { name: 'Sierra Leone', flag: '🇸🇱' },
  { name: 'Somalie', flag: '🇸🇴' },
  { name: 'Soudan', flag: '🇸🇩' },
  { name: 'Soudan du Sud', flag: '🇸🇸' },
  { name: 'Tanzanie', flag: '🇹🇿' },
  { name: 'Tchad', flag: '🇹🇩' },
  { name: 'Togo', flag: '🇹🇬' },
  { name: 'Tunisie', flag: '🇹🇳' },
  { name: 'Zambie', flag: '🇿🇲' },
  { name: 'Zimbabwe', flag: '🇿🇼' }
] as const;

export const africanCountryNames: readonly string[] = africanCountries.map((country) => country.name);

export const schoolTypeLabels: Record<SchoolType, string> = {
  creche: 'Crèche / garderie',
  maternelle: 'Maternelle',
  primary: 'Primaire',
  secondary: 'Secondaire',
  secondary_general: 'Secondaire général',
  secondary_technical: 'Secondaire technique / professionnel',
  training_center: 'Centre de formation',
  haute_ecole: 'Haute école / institut supérieur',
  university: 'Université',
  primary_secondary: 'Primaire et secondaire',
  mixed: 'École mixte'
};

export const studentCategoryLabels: Record<StudentCategory, string> = {
  creche: 'Crèche / garderie',
  maternelle: 'Maternelle',
  primaire: 'Primaire',
  secondaire: 'Secondaire',
  secondaire_general: 'Secondaire général',
  secondaire_technique: 'Secondaire technique / professionnel',
  formation: 'Centre de formation',
  haute_ecole: 'Haute école / institut supérieur',
  universite: 'Université',
  mixte: 'École mixte / complexe scolaire'
};

export const schoolStatusLabels: Record<SchoolStatus, string> = {
  private: 'Privée',
  public: 'Publique',
  faith_based: 'Conventionnée / confessionnelle',
  community: 'Communautaire'
};

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  sw: 'Kiswahili',
  ln: 'Lingala',
  lua: 'Tshiluba',
  kg: 'Kikongo',
  tll: 'Kitetela'
};

export const translations = {
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.students': 'Élèves',
    'nav.teachers': 'Enseignants',
    'nav.parents': 'Parents',
    'nav.classes': 'Classes',
    'nav.attendance': 'Présences',
    'nav.grades': 'Notes',
    'nav.payments': 'Paiements',
    'nav.messages': 'Messages',
    'nav.settings': 'Paramètres',
    'grades.workspace': 'Espace de travail',
    'grades.title': 'Notes',
    'grades.description': 'Suivez les évaluations, les trimestres, les coefficients et la performance des élèves depuis l’API partagée.',
    'grades.add': 'Ajouter une note',
    'grades.learners': 'Élèves',
    'grades.learnersDetail': 'Élèves avec notes',
    'grades.average': 'Moyenne',
    'grades.averageDetail': 'Moyenne par élève',
    'grades.weightedAverage': 'Moyenne coeff.',
    'grades.weightedDetail': 'Avec coefficients',
    'grades.term': 'Trimestre',
    'grades.termDetail': 'Filtre actuel',
    'grades.searchPlaceholder': 'Rechercher un élève, une classe, un cours ou un commentaire',
    'grades.student': 'Élève',
    'grades.class': 'Classe',
    'grades.courses': 'Cours',
    'grades.notes': 'Notes',
    'grades.avgPoints': 'Moyenne points',
    'grades.performance': 'Performance',
    'grades.profile': 'Profil',
    'grades.viewNotes': 'Voir les notes',
    'grades.emptyTitle': 'Aucune note trouvée',
    'grades.emptyDescription': 'Ajoutez une note ou modifiez les filtres.',
    'grades.page': 'Page',
    'grades.of': 'sur',
    'grades.previous': 'Précédent',
    'grades.next': 'Suivant',
    'grades.all': 'Tous',
    'grades.loadError': 'Impossible de charger les notes',
    'gradeForm.assessment': 'Évaluation',
    'gradeForm.title': 'Ajouter une note',
    'gradeForm.class': 'Classe',
    'gradeForm.selectClass': 'Sélectionner une classe',
    'gradeForm.student': 'Élève',
    'gradeForm.selectStudent': 'Sélectionner un élève',
    'gradeForm.subject': 'Cours',
    'gradeForm.selectSubject': 'Sélectionner un cours',
    'gradeForm.score': 'Points obtenus',
    'gradeForm.maxScore': 'Total possible',
    'gradeForm.coefficient': 'Coefficient',
    'gradeForm.term': 'Trimestre',
    'gradeForm.comment': 'Commentaire',
    'gradeForm.cancel': 'Annuler',
    'gradeForm.saving': 'Enregistrement...',
    'gradeForm.submit': 'Enregistrer la note',
    'gradeForm.error': 'Impossible d’enregistrer la note',
    'student.back': 'Retour aux élèves',
    'student.unavailable': 'Élève indisponible',
    'student.notFound': 'Ce dossier élève est introuvable.',
    'student.active': 'Élève actif',
    'student.inactive': 'Élève inactif',
    'student.average': 'Moyenne',
    'student.averageDetail': 'Toutes matières coefficientées',
    'student.coursesEvaluated': 'Cours évalués',
    'student.coursesDetail': 'Matières avec notes',
    'student.notesDetail': 'Points enregistrés',
    'student.details': 'Informations de l’élève',
    'student.gender': 'Genre',
    'student.birthDate': 'Date de naissance',
    'student.class': 'Classe',
    'student.schoolId': 'ID école',
    'student.parents': 'Parents et responsables',
    'student.noPhone': 'Aucun téléphone enregistré',
    'student.noGuardian': 'Aucun responsable lié',
    'student.noGuardianDetail': 'Associez un parent depuis le formulaire d’édition de l’élève.',
    'student.annualEvolution': 'Évolution annuelle',
    'student.termAverage': 'Moyenne par trimestre',
    'student.annual': 'annuel',
    'student.pointsByCourse': 'Points par cours',
    'student.allGrades': 'Toutes les notes de l’élève',
    'student.emptyGrades': 'Aucune note',
    'student.emptyGradesDetail': 'Les notes de chaque cours apparaîtront ici.',
    'student.course': 'Cours',
    'student.points': 'Points',
    'student.notSet': 'Non défini',
    'student.unassigned': 'Non assigné',
    'student.loadError': 'Impossible de charger l’élève',
    'student.space': 'Espace élève',
    'student.myCourses': 'Mes cours',
    'student.myCoursesDescription': 'Voici les matières de votre classe, avec les enseignants et les informations scolaires associées.',
    'student.loadCoursesError': 'Impossible de charger vos cours.',
    'student.classLinked': 'Classe liée à votre profil',
    'student.programSubjects': 'Matières dans votre programme',
    'student.associatedTeachers': 'Professeurs associés',
    'student.searchCourse': 'Rechercher un cours',
    'student.noCoursesFound': 'Aucun cours trouvé',
    'student.noCoursesDetail': 'Les cours de votre classe apparaîtront ici dès qu’ils seront assignés par l’école.',
    'student.room': 'Salle',
    'student.unassignedClass': 'Classe non assignée',
    'student.finalizeAssignment': 'Contactez l’école pour finaliser votre affectation.',
    'student.myGrades': 'Mes notes',
    'student.myGradesDescription': 'Consultez vos points par cours, vos moyennes et votre évolution pendant l’année.',
    'student.loadGradesError': 'Impossible de charger vos notes.',
    'student.currentAverage': 'Moyenne actuelle',
    'student.evaluatedCourses': 'Cours évalués',
    'student.subjectsWithPoints': 'Matières avec points',
    'student.recordedAssessments': 'Évaluations enregistrées',
    'student.searchCourseComment': 'Rechercher un cours ou commentaire',
    'student.allTerms': 'Tous les trimestres',
    'student.evolution': 'Évolution',
    'student.averageByTerm': 'Moyenne par trimestre',
    'student.noGradesFound': 'Aucune note trouvée',
    'student.noGradesDetail': 'Vos notes apparaîtront ici dès qu’un enseignant les aura enregistrées.',
    'student.coefficient': 'Coeff.',
    'student.myAttendance': 'Mes présences',
    'student.myAttendanceDescription': 'Consultez votre historique de présence, vos retards et les observations enregistrées par l’école.',
    'student.loadAttendanceError': 'Impossible de charger vos présences.',
    'student.personalAttendance': 'Présences personnelles',
    'student.attendanceRate': 'Taux de présence',
    'student.confirmedPresence': 'Présences confirmées',
    'student.present': 'Présent',
    'student.absent': 'Absent',
    'student.late': 'En retard',
    'student.excused': 'Excusé',
    'student.presentDays': 'Jours marqués présent',
    'student.lateArrivals': 'Arrivées tardives',
    'student.recordedAbsences': 'Absences enregistrées',
    'student.recentDays': 'Derniers jours',
    'student.noAttendance': 'Aucune présence',
    'student.noAttendanceDetail': 'Votre historique apparaîtra ici après le premier appel.',
    'student.searchAttendance': 'Rechercher une date, classe ou note',
    'student.allStatuses': 'Tous les statuts',
    'student.date': 'Date',
    'student.status': 'Statut',
    'student.observation': 'Observation',
    'student.noComment': 'Aucune remarque',
    'student.noAttendanceFound': 'Aucune présence trouvée',
    'student.noAttendanceFoundDetail': 'Changez le filtre ou attendez que l’école enregistre de nouvelles présences.',
    'student.myMessages': 'Mes messages',
    'student.myMessagesDescription': 'Retrouvez les annonces importantes et échangez avec l’administration ou votre enseignant principal.',
    'student.loadMessagesError': 'Impossible de charger vos messages.',
    'student.loadConversationError': 'Impossible de charger cette conversation.',
    'student.sendMessageError': 'Impossible d’envoyer ce message.',
    'student.secureSchoolMessaging': 'Messagerie scolaire sécurisée',
    'student.conversations': 'Conversations',
    'student.allowedContacts': 'Contacts autorisés',
    'student.unread': 'Non lus',
    'student.messagesToRead': 'Messages à lire',
    'student.access': 'Accès',
    'student.securedAccess': 'Sécurisé',
    'student.schoolTeacherOnly': 'École et enseignant seulement',
    'student.searchContact': 'Rechercher un contact',
    'student.noContact': 'Aucun contact',
    'student.noContactDetail': 'Vos contacts apparaîtront ici dès que l’école les aura activés.',
    'student.conversation': 'Conversation',
    'student.selectContact': 'Sélectionnez un contact',
    'student.noMessage': 'Aucun message',
    'student.noMessageDetail': 'Commencez une conversation courte et claire.',
    'student.chooseContact': 'Choisissez un contact',
    'student.chooseContactDetail': 'Sélectionnez l’administration ou un enseignant pour ouvrir la conversation.',
    'student.writeTo': 'Écrire à',
    'student.schoolAdmin': 'Administration',
    'student.superAdmin': 'Super admin',
    'student.teacherRole': 'Enseignant',
    'student.parentRole': 'Parent',
    'student.studentRole': 'Élève',
    'student.myProfile': 'Mon profil',
    'student.myProfileDescription': 'Vos informations personnelles, votre classe, vos responsables et vos accès scolaires.',
    'student.loadProfileError': 'Impossible de charger votre profil.',
    'student.studentCode': 'Code élève',
    'student.identity': 'Identité',
    'student.accountEmail': 'E-mail du compte',
    'student.profileNotFound': 'Profil introuvable',
    'student.profileNotFoundDetail': 'Le compte connecté n’est pas encore lié à un dossier élève.',
    'student.schooling': 'Scolarité',
    'student.mainTeacher': 'Titulaire',
    'student.contactViaMessages': 'Contact via Messages',
    'student.mainClassroom': 'Lieu principal des cours',
    'student.cycle': 'Cycle',
    'student.optionNotSet': 'Option non renseignée',
    'student.noSubjectAssigned': 'Aucun cours assigné pour le moment.',
    'student.familyContacts': 'Famille et contacts',
    'student.guardian': 'Responsable',
    'student.phoneNotSet': 'Téléphone non renseigné',
    'student.adminCanComplete': 'L’administration peut compléter ce dossier.',
    'student.schoolContacts': 'Contacts école',
    'student.available': 'disponibles',
    'student.adminAndTeacher': 'Administration et enseignant principal',
    'student.activeYearMissing': 'Aucune année active',
    'student.schoolAssignment': 'Affectation scolaire',
    'student.secureProfile': 'Profil sécurisé',
    'common.search': 'Rechercher',
    'common.language': 'Langue',
    'common.signOut': 'Se déconnecter',
    'role.schoolAdmin': 'Administration scolaire',
    'layout.campus': 'Campus de Kigali',
    'layout.title': 'Tableau de bord scolaire',
    'layout.searchPlaceholder': 'Rechercher élèves, enseignants, classes',
    'layout.termHealth': 'Santé du trimestre',
    'layout.termHealthDetail': 'Le suivi des présences et des paiements est actif pour le trimestre 2.',
    'auth.welcome': 'Bon retour',
    'auth.loginTitle': 'Connectez-vous à votre école',
    'auth.email': 'Adresse e-mail',
    'auth.password': 'Mot de passe',
    'auth.signingIn': 'Connexion...',
    'auth.signIn': 'Se connecter',
    'auth.newSchool': 'Nouvelle école ?',
    'auth.registerSchool': 'Inscrire votre école',
    'auth.startWorkspace': 'Démarrer votre espace',
    'auth.registerTitle': 'Inscrire une école',
    'auth.createWorkspace': 'Créer l’espace scolaire',
    'auth.creatingWorkspace': 'Création de l’espace...',
    'dashboard.commandCenter': 'Centre de pilotage scolaire',
    'dashboard.heroTitle': 'Gérez la journée scolaire depuis un espace clair.',
    'dashboard.heroBody': 'Suivez les présences, paiements, classes et communications familiales avec la vitesse d’une plateforme SaaS africaine moderne.',
    'dashboard.today': 'Aujourd’hui',
    'dashboard.openTasks': 'Tâches ouvertes',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.adminShortcuts': 'Raccourcis admin',
    'dashboard.registerStudent': 'Inscrire un élève',
    'dashboard.recordPayment': 'Enregistrer un paiement',
    'dashboard.sendMessage': 'Envoyer un message',
    'dashboard.markAttendance': 'Marquer les présences',
    'dashboard.totalStudents': 'Total des élèves',
    'dashboard.totalTeachers': 'Total des enseignants',
    'dashboard.totalClasses': 'Total des classes',
    'dashboard.attendanceToday': 'Présences du jour',
    'dashboard.pendingPayments': 'Paiements en attente',
    'dashboard.recentNotifications': 'Notifications récentes',
    'dashboard.payments': 'Paiements',
    'dashboard.paymentFollowUp': 'Suivi des paiements en attente',
    'dashboard.attendance': 'Présences',
    'dashboard.todayByStatus': 'Aujourd’hui par statut',
    'dashboard.noNotifications': 'Aucune notification récente',
    'dashboard.noNotificationsDetail': 'Les messages de l’API apparaîtront ici.',
    'mobile.goodDay': 'Bonjour',
    'mobile.connected': 'Centre mobile connecté à la même API EVOYAMWANA.',
    'mobile.todayFromDb': 'Aujourd’hui depuis PostgreSQL'
  },
  sw: {
    'nav.dashboard': 'Dashibodi',
    'nav.students': 'Wanafunzi',
    'nav.teachers': 'Walimu',
    'nav.parents': 'Wazazi',
    'nav.classes': 'Madarasa',
    'nav.attendance': 'Mahudhurio',
    'nav.grades': 'Alama',
    'nav.payments': 'Malipo',
    'nav.messages': 'Ujumbe',
    'nav.settings': 'Mipangilio',
    'grades.workspace': 'Eneo la kazi',
    'grades.title': 'Alama',
    'grades.description': 'Fuatilia mitihani, mihula, viwango na maendeleo ya wanafunzi kutoka API ya pamoja.',
    'grades.add': 'Ongeza alama',
    'grades.learners': 'Wanafunzi',
    'grades.learnersDetail': 'Wanafunzi wenye alama',
    'grades.average': 'Wastani',
    'grades.averageDetail': 'Wastani kwa mwanafunzi',
    'grades.weightedAverage': 'Wastani wa coeff.',
    'grades.weightedDetail': 'Pamoja na coefficients',
    'grades.term': 'Muhula',
    'grades.termDetail': 'Kichujio cha sasa',
    'grades.searchPlaceholder': 'Tafuta mwanafunzi, darasa, somo au maoni',
    'grades.student': 'Mwanafunzi',
    'grades.class': 'Darasa',
    'grades.courses': 'Masomo',
    'grades.notes': 'Alama',
    'grades.avgPoints': 'Wastani wa pointi',
    'grades.performance': 'Utendaji',
    'grades.profile': 'Wasifu',
    'grades.viewNotes': 'Tazama alama',
    'grades.emptyTitle': 'Hakuna alama',
    'grades.emptyDescription': 'Ongeza alama au badilisha vichujio.',
    'grades.page': 'Ukurasa',
    'grades.of': 'kati ya',
    'grades.previous': 'Iliyopita',
    'grades.next': 'Inayofuata',
    'grades.all': 'Zote',
    'grades.loadError': 'Haiwezi kupakia alama',
    'gradeForm.assessment': 'Tathmini',
    'gradeForm.title': 'Ongeza alama',
    'gradeForm.class': 'Darasa',
    'gradeForm.selectClass': 'Chagua darasa',
    'gradeForm.student': 'Mwanafunzi',
    'gradeForm.selectStudent': 'Chagua mwanafunzi',
    'gradeForm.subject': 'Somo',
    'gradeForm.selectSubject': 'Chagua somo',
    'gradeForm.score': 'Pointi zilizopatikana',
    'gradeForm.maxScore': 'Jumla iwezekanayo',
    'gradeForm.coefficient': 'Coefficient',
    'gradeForm.term': 'Muhula',
    'gradeForm.comment': 'Maoni',
    'gradeForm.cancel': 'Ghairi',
    'gradeForm.saving': 'Inahifadhi...',
    'gradeForm.submit': 'Hifadhi alama',
    'gradeForm.error': 'Haiwezi kuhifadhi alama',
    'student.back': 'Rudi kwa wanafunzi',
    'student.unavailable': 'Mwanafunzi hapatikani',
    'student.notFound': 'Rekodi ya mwanafunzi haikupatikana.',
    'student.active': 'Mwanafunzi hai',
    'student.inactive': 'Mwanafunzi si hai',
    'student.average': 'Wastani',
    'student.averageDetail': 'Masomo yote kwa coefficient',
    'student.coursesEvaluated': 'Masomo yaliyotathminiwa',
    'student.coursesDetail': 'Masomo yenye alama',
    'student.notesDetail': 'Pointi zilizorekodiwa',
    'student.details': 'Taarifa za mwanafunzi',
    'student.gender': 'Jinsia',
    'student.birthDate': 'Tarehe ya kuzaliwa',
    'student.class': 'Darasa',
    'student.schoolId': 'ID ya shule',
    'student.parents': 'Wazazi na walezi',
    'student.noPhone': 'Hakuna simu iliyorekodiwa',
    'student.noGuardian': 'Hakuna mlezi aliyeunganishwa',
    'student.noGuardianDetail': 'Unganisha mzazi kupitia fomu ya kuhariri mwanafunzi.',
    'student.annualEvolution': 'Mabadiliko ya mwaka',
    'student.termAverage': 'Wastani kwa muhula',
    'student.annual': 'kwa mwaka',
    'student.pointsByCourse': 'Pointi kwa somo',
    'student.allGrades': 'Alama zote za mwanafunzi',
    'student.emptyGrades': 'Hakuna alama',
    'student.emptyGradesDetail': 'Alama za kila somo zitaonekana hapa.',
    'student.course': 'Somo',
    'student.points': 'Pointi',
    'student.notSet': 'Haijawekwa',
    'student.unassigned': 'Haijapangiwa',
    'student.loadError': 'Haiwezi kupakia mwanafunzi',
    'student.space': 'Eneo la mwanafunzi',
    'student.myCourses': 'Masomo yangu',
    'student.myCoursesDescription': 'Hapa kuna masomo ya darasa lako, walimu na taarifa za shule.',
    'student.loadCoursesError': 'Haiwezi kupakia masomo yako.',
    'student.classLinked': 'Darasa lililounganishwa na wasifu wako',
    'student.programSubjects': 'Masomo katika programu yako',
    'student.associatedTeachers': 'Walimu wanaohusika',
    'student.searchCourse': 'Tafuta somo',
    'student.noCoursesFound': 'Hakuna somo lililopatikana',
    'student.noCoursesDetail': 'Masomo ya darasa lako yataonekana hapa shule ikiyapanga.',
    'student.room': 'Chumba',
    'student.unassignedClass': 'Darasa halijapangiwa',
    'student.finalizeAssignment': 'Wasiliana na shule kukamilisha upangaji wako.',
    'student.myGrades': 'Alama zangu',
    'student.myGradesDescription': 'Angalia alama zako kwa kila somo, wastani na maendeleo ya mwaka.',
    'student.loadGradesError': 'Haiwezi kupakia alama zako.',
    'student.currentAverage': 'Wastani wa sasa',
    'student.evaluatedCourses': 'Masomo yaliyopimwa',
    'student.subjectsWithPoints': 'Masomo yenye alama',
    'student.recordedAssessments': 'Tathmini zilizosajiliwa',
    'student.searchCourseComment': 'Tafuta somo au maoni',
    'student.allTerms': 'Mihula yote',
    'student.evolution': 'Maendeleo',
    'student.averageByTerm': 'Wastani kwa muhula',
    'student.noGradesFound': 'Hakuna alama zilizopatikana',
    'student.noGradesDetail': 'Alama zako zitaonekana hapa mwalimu akizisajili.',
    'student.coefficient': 'Kipimo',
    'student.myAttendance': 'Mahudhurio yangu',
    'student.myAttendanceDescription': 'Angalia historia ya mahudhurio, kuchelewa na maoni ya shule.',
    'student.loadAttendanceError': 'Haiwezi kupakia mahudhurio yako.',
    'student.personalAttendance': 'Mahudhurio binafsi',
    'student.attendanceRate': 'Kiwango cha mahudhurio',
    'student.confirmedPresence': 'Mahudhurio yaliyothibitishwa',
    'student.present': 'Yupo',
    'student.absent': 'Hayupo',
    'student.late': 'Amechelewa',
    'student.excused': 'Amesamehewa',
    'student.presentDays': 'Siku alizokuwepo',
    'student.lateArrivals': 'Kuchelewa kulikosajiliwa',
    'student.recordedAbsences': 'Kutokuwepo kulikosajiliwa',
    'student.recentDays': 'Siku za karibuni',
    'student.noAttendance': 'Hakuna mahudhurio',
    'student.noAttendanceDetail': 'Historia yako itaonekana hapa baada ya mahudhurio ya kwanza.',
    'student.searchAttendance': 'Tafuta tarehe, darasa au maoni',
    'student.allStatuses': 'Hali zote',
    'student.date': 'Tarehe',
    'student.status': 'Hali',
    'student.observation': 'Maoni',
    'student.noComment': 'Hakuna maoni',
    'student.noAttendanceFound': 'Hakuna mahudhurio yaliyopatikana',
    'student.noAttendanceFoundDetail': 'Badilisha kichujio au subiri shule isajili mahudhurio mapya.',
    'student.myMessages': 'Ujumbe wangu',
    'student.myMessagesDescription': 'Pata matangazo muhimu na zungumza na utawala au mwalimu mkuu.',
    'student.loadMessagesError': 'Haiwezi kupakia ujumbe wako.',
    'student.loadConversationError': 'Haiwezi kupakia mazungumzo haya.',
    'student.sendMessageError': 'Haiwezi kutuma ujumbe huu.',
    'student.secureSchoolMessaging': 'Ujumbe salama wa shule',
    'student.conversations': 'Mazungumzo',
    'student.allowedContacts': 'Mawasiliano yaliyoruhusiwa',
    'student.unread': 'Haijasomwa',
    'student.messagesToRead': 'Ujumbe wa kusoma',
    'student.access': 'Ufikiaji',
    'student.securedAccess': 'Salama',
    'student.schoolTeacherOnly': 'Shule na mwalimu tu',
    'student.searchContact': 'Tafuta mawasiliano',
    'student.noContact': 'Hakuna mawasiliano',
    'student.noContactDetail': 'Mawasiliano yako yataonekana hapa shule ikiyawezesha.',
    'student.conversation': 'Mazungumzo',
    'student.selectContact': 'Chagua mawasiliano',
    'student.noMessage': 'Hakuna ujumbe',
    'student.noMessageDetail': 'Anza mazungumzo mafupi na wazi.',
    'student.chooseContact': 'Chagua mawasiliano',
    'student.chooseContactDetail': 'Chagua utawala au mwalimu kufungua mazungumzo.',
    'student.writeTo': 'Andika kwa',
    'student.schoolAdmin': 'Utawala',
    'student.superAdmin': 'Super admin',
    'student.teacherRole': 'Mwalimu',
    'student.parentRole': 'Mzazi',
    'student.studentRole': 'Mwanafunzi',
    'student.myProfile': 'Wasifu wangu',
    'student.myProfileDescription': 'Taarifa zako binafsi, darasa, walezi na ufikiaji wa shule.',
    'student.loadProfileError': 'Haiwezi kupakia wasifu wako.',
    'student.studentCode': 'Nambari ya mwanafunzi',
    'student.identity': 'Utambulisho',
    'student.accountEmail': 'Barua pepe ya akaunti',
    'student.profileNotFound': 'Wasifu haujapatikana',
    'student.profileNotFoundDetail': 'Akaunti hii bado haijaunganishwa na faili ya mwanafunzi.',
    'student.schooling': 'Masomo',
    'student.mainTeacher': 'Mwalimu mkuu',
    'student.contactViaMessages': 'Wasiliana kupitia Ujumbe',
    'student.mainClassroom': 'Mahali pa masomo',
    'student.cycle': 'Mzunguko',
    'student.optionNotSet': 'Chaguo halijawekwa',
    'student.noSubjectAssigned': 'Hakuna somo lililopangiwa kwa sasa.',
    'student.familyContacts': 'Familia na mawasiliano',
    'student.guardian': 'Mlezi',
    'student.phoneNotSet': 'Simu haijawekwa',
    'student.adminCanComplete': 'Utawala unaweza kukamilisha faili hii.',
    'student.schoolContacts': 'Mawasiliano ya shule',
    'student.available': 'zinapatikana',
    'student.adminAndTeacher': 'Utawala na mwalimu mkuu',
    'student.activeYearMissing': 'Hakuna mwaka hai',
    'student.schoolAssignment': 'Upangaji wa shule',
    'student.secureProfile': 'Wasifu salama',
    'common.search': 'Tafuta',
    'common.language': 'Lugha',
    'common.signOut': 'Toka',
    'role.schoolAdmin': 'Usimamizi wa shule',
    'layout.campus': 'Kampasi ya Kigali',
    'layout.title': 'Dashibodi ya shule',
    'layout.searchPlaceholder': 'Tafuta wanafunzi, walimu, madarasa',
    'layout.termHealth': 'Hali ya muhula',
    'layout.termHealthDetail': 'Ufuatiliaji wa mahudhurio na malipo unaendelea kwa muhula wa 2.',
    'auth.welcome': 'Karibu tena',
    'auth.loginTitle': 'Ingia kwenye shule yako',
    'auth.email': 'Barua pepe',
    'auth.password': 'Nenosiri',
    'auth.signingIn': 'Inaingia...',
    'auth.signIn': 'Ingia',
    'auth.newSchool': 'Shule mpya?',
    'auth.registerSchool': 'Sajili shule yako',
    'auth.startWorkspace': 'Anza nafasi yako',
    'auth.registerTitle': 'Sajili shule',
    'auth.createWorkspace': 'Unda nafasi ya shule',
    'auth.creatingWorkspace': 'Inaunda nafasi...',
    'dashboard.commandCenter': 'Kituo cha uongozi wa shule',
    'dashboard.heroTitle': 'Endesha siku ya shule kutoka sehemu safi.',
    'dashboard.heroBody': 'Fuatilia mahudhurio, malipo, madarasa na mawasiliano ya familia kwa kasi ya SaaS ya kisasa ya Afrika.',
    'dashboard.today': 'Leo',
    'dashboard.openTasks': 'Kazi wazi',
    'dashboard.quickActions': 'Vitendo vya haraka',
    'dashboard.adminShortcuts': 'Njia za haraka za msimamizi',
    'dashboard.registerStudent': 'Sajili mwanafunzi',
    'dashboard.recordPayment': 'Rekodi malipo',
    'dashboard.sendMessage': 'Tuma ujumbe',
    'dashboard.markAttendance': 'Weka mahudhurio',
    'dashboard.totalStudents': 'Jumla ya wanafunzi',
    'dashboard.totalTeachers': 'Jumla ya walimu',
    'dashboard.totalClasses': 'Jumla ya madarasa',
    'dashboard.attendanceToday': 'Mahudhurio ya leo',
    'dashboard.pendingPayments': 'Malipo yanayosubiri',
    'dashboard.recentNotifications': 'Taarifa za karibuni',
    'dashboard.payments': 'Malipo',
    'dashboard.paymentFollowUp': 'Ufuatiliaji wa malipo',
    'dashboard.attendance': 'Mahudhurio',
    'dashboard.todayByStatus': 'Leo kwa hali',
    'dashboard.noNotifications': 'Hakuna taarifa za karibuni',
    'dashboard.noNotificationsDetail': 'Ujumbe kutoka API utaonekana hapa.',
    'mobile.goodDay': 'Habari',
    'mobile.connected': 'Kituo cha simu kimeunganishwa na API ileile ya EVOYAMWANA.',
    'mobile.todayFromDb': 'Leo kutoka PostgreSQL'
  },
  ln: {
    'nav.dashboard': 'Tablo ya mosala',
    'nav.students': 'Bana-kelasi',
    'nav.teachers': 'Balakisi',
    'nav.parents': 'Baboti',
    'nav.classes': 'Bakelasi',
    'nav.attendance': 'Boyei',
    'nav.grades': 'Bapwɛ',
    'nav.payments': 'Bafuti',
    'nav.messages': 'Bansango',
    'nav.settings': 'Mibongisi',
    'grades.workspace': 'Esika ya mosala',
    'grades.title': 'Bapwɛ',
    'grades.description': 'Landá mimekano, batrimestre, coefficients mpe bokoli ya bana-kelasi uta na API moko.',
    'grades.add': 'Bakisa note',
    'grades.learners': 'Bana-kelasi',
    'grades.learnersDetail': 'Bana-kelasi oyo bazali na bapwɛ',
    'grades.average': 'Moyenne',
    'grades.averageDetail': 'Moyenne ya mwana-kelasi',
    'grades.weightedAverage': 'Moyenne coeff.',
    'grades.weightedDetail': 'Na coefficients',
    'grades.term': 'Trimestre',
    'grades.termDetail': 'Filtre ya sikoyo',
    'grades.searchPlaceholder': 'Luka mwana-kelasi, kelasi, cours to commentaire',
    'grades.student': 'Mwana-kelasi',
    'grades.class': 'Kelasi',
    'grades.courses': 'Cours',
    'grades.notes': 'Bapwɛ',
    'grades.avgPoints': 'Moyenne ya points',
    'grades.performance': 'Performance',
    'grades.profile': 'Profil',
    'grades.viewNotes': 'Tala bapwɛ',
    'grades.emptyTitle': 'Bapwɛ ezali te',
    'grades.emptyDescription': 'Bakisa note to bongola ba filtres.',
    'grades.page': 'Lokasa',
    'grades.of': 'na',
    'grades.previous': 'Ya liboso',
    'grades.next': 'Ya sima',
    'grades.all': 'Nyonso',
    'grades.loadError': 'Kokoka te kocharger bapwɛ',
    'gradeForm.assessment': 'Evaluation',
    'gradeForm.title': 'Bakisa note',
    'gradeForm.class': 'Kelasi',
    'gradeForm.selectClass': 'Pona kelasi',
    'gradeForm.student': 'Mwana-kelasi',
    'gradeForm.selectStudent': 'Pona mwana-kelasi',
    'gradeForm.subject': 'Cours',
    'gradeForm.selectSubject': 'Pona cours',
    'gradeForm.score': 'Points ezwami',
    'gradeForm.maxScore': 'Total possible',
    'gradeForm.coefficient': 'Coefficient',
    'gradeForm.term': 'Trimestre',
    'gradeForm.comment': 'Commentaire',
    'gradeForm.cancel': 'Longola',
    'gradeForm.saving': 'Ezali kobomba...',
    'gradeForm.submit': 'Bomba note',
    'gradeForm.error': 'Kobomba note ekoki te',
    'student.back': 'Zonga na bana-kelasi',
    'student.unavailable': 'Mwana-kelasi azali te',
    'student.notFound': 'Dossier ya mwana-kelasi emonani te.',
    'student.active': 'Mwana-kelasi active',
    'student.inactive': 'Mwana-kelasi inactive',
    'student.average': 'Moyenne',
    'student.averageDetail': 'Cours nyonso na coefficients',
    'student.coursesEvaluated': 'Cours oyo etalelami',
    'student.coursesDetail': 'Cours na bapwɛ',
    'student.notesDetail': 'Points ekomami',
    'student.details': 'Makambo ya mwana-kelasi',
    'student.gender': 'Genre',
    'student.birthDate': 'Mokolo ya mbotama',
    'student.class': 'Kelasi',
    'student.schoolId': 'ID ya eteyelo',
    'student.parents': 'Baboti mpe bakambi',
    'student.noPhone': 'Telephone ekomami te',
    'student.noGuardian': 'Mokambi moko te',
    'student.noGuardianDetail': 'Kangisa moboti na formulaire ya kobongisa mwana-kelasi.',
    'student.annualEvolution': 'Bokoli ya mobu',
    'student.termAverage': 'Moyenne na trimestre',
    'student.annual': 'ya mobu',
    'student.pointsByCourse': 'Points na cours',
    'student.allGrades': 'Bapwɛ nyonso ya mwana-kelasi',
    'student.emptyGrades': 'Bapwɛ ezali te',
    'student.emptyGradesDetail': 'Bapwɛ ya cours nyonso ekomonana awa.',
    'student.course': 'Cours',
    'student.points': 'Points',
    'student.notSet': 'Etyami te',
    'student.unassigned': 'Epesami te',
    'student.loadError': 'Kokoka te kocharger mwana-kelasi',
    'student.space': 'Espace ya moyekoli',
    'student.myCourses': 'Ba cours na ngai',
    'student.myCoursesDescription': 'Tala ba matières ya classe na yo, balakisi mpe ba informations ya kelasi.',
    'student.loadCoursesError': 'Kokoka te kocharger ba cours na yo.',
    'student.classLinked': 'Classe ekangami na profil na yo',
    'student.programSubjects': 'Matières ya programme na yo',
    'student.associatedTeachers': 'Balakisi oyo bakangami',
    'student.searchCourse': 'Luka cours',
    'student.noCoursesFound': 'Cours moko te emonani',
    'student.noCoursesDetail': 'Ba cours ya classe na yo ekomonana awa soki kelasi epesi yango.',
    'student.room': 'Salle',
    'student.unassignedClass': 'Classe epesami te',
    'student.finalizeAssignment': 'Solola na kelasi pona kosilisa affectation.',
    'student.myGrades': 'Ba notes na ngai',
    'student.myGradesDescription': 'Tala ba points, moyennes mpe évolution ya mbula.',
    'student.loadGradesError': 'Kokoka te kocharger ba notes na yo.',
    'student.currentAverage': 'Moyenne ya sikoyo',
    'student.evaluatedCourses': 'Ba cours évalués',
    'student.subjectsWithPoints': 'Matières na points',
    'student.recordedAssessments': 'Ba évaluations ekomami',
    'student.searchCourseComment': 'Luka cours to commentaire',
    'student.allTerms': 'Ba trimestres nyonso',
    'student.evolution': 'Evolution',
    'student.averageByTerm': 'Moyenne na trimestre',
    'student.noGradesFound': 'Note moko te emonani',
    'student.noGradesDetail': 'Ba notes na yo ekomonana awa soki molakisi akomi yango.',
    'student.coefficient': 'Coeff.',
    'student.myAttendance': 'Présences na ngai',
    'student.myAttendanceDescription': 'Tala historique ya présence, retard mpe observations ya kelasi.',
    'student.loadAttendanceError': 'Kokoka te kocharger présences na yo.',
    'student.personalAttendance': 'Présence personnelle',
    'student.attendanceRate': 'Taux ya présence',
    'student.confirmedPresence': 'Présences confirmées',
    'student.present': 'Azali',
    'student.absent': 'Azangi',
    'student.late': 'Retard',
    'student.excused': 'Excusé',
    'student.presentDays': 'Mikolo azalaki',
    'student.lateArrivals': 'Retards ekomami',
    'student.recordedAbsences': 'Absences ekomami',
    'student.recentDays': 'Mikolo ya sika',
    'student.noAttendance': 'Présence moko te',
    'student.noAttendanceDetail': 'Historique na yo ekomonana awa sima ya appel ya liboso.',
    'student.searchAttendance': 'Luka date, classe to note',
    'student.allStatuses': 'Ba statuts nyonso',
    'student.date': 'Date',
    'student.status': 'Statut',
    'student.observation': 'Observation',
    'student.noComment': 'Remarque te',
    'student.noAttendanceFound': 'Présence moko te emonani',
    'student.noAttendanceFoundDetail': 'Bongola filtre to zela kelasi ekoma présence ya sika.',
    'student.myMessages': 'Ba messages na ngai',
    'student.myMessagesDescription': 'Tala ba annonces ya ntina mpe solola na administration to molakisi.',
    'student.loadMessagesError': 'Kokoka te kocharger ba messages na yo.',
    'student.loadConversationError': 'Kokoka te kocharger conversation oyo.',
    'student.sendMessageError': 'Kokoka te kotinda message oyo.',
    'student.secureSchoolMessaging': 'Messagerie ya kelasi ya sécurité',
    'student.conversations': 'Ba conversations',
    'student.allowedContacts': 'Ba contacts autorisés',
    'student.unread': 'Etangami te',
    'student.messagesToRead': 'Ba messages ya kotanga',
    'student.access': 'Accès',
    'student.securedAccess': 'Sécurisé',
    'student.schoolTeacherOnly': 'Kelasi mpe molakisi kaka',
    'student.searchContact': 'Luka contact',
    'student.noContact': 'Contact moko te',
    'student.noContactDetail': 'Ba contacts na yo ekomonana awa soki kelasi efungoli yango.',
    'student.conversation': 'Conversation',
    'student.selectContact': 'Pona contact',
    'student.noMessage': 'Message moko te',
    'student.noMessageDetail': 'Banda conversation mokuse mpe polele.',
    'student.chooseContact': 'Pona contact',
    'student.chooseContactDetail': 'Pona administration to molakisi pona kofungola conversation.',
    'student.writeTo': 'Komela',
    'student.schoolAdmin': 'Administration',
    'student.superAdmin': 'Super admin',
    'student.teacherRole': 'Molakisi',
    'student.parentRole': 'Moboti',
    'student.studentRole': 'Moyekoli',
    'student.myProfile': 'Profil na ngai',
    'student.myProfileDescription': 'Ba informations na yo, classe, responsables mpe accès ya kelasi.',
    'student.loadProfileError': 'Kokoka te kocharger profil na yo.',
    'student.studentCode': 'Code ya moyekoli',
    'student.identity': 'Identité',
    'student.accountEmail': 'E-mail ya compte',
    'student.profileNotFound': 'Profil emonani te',
    'student.profileNotFoundDetail': 'Compte oyo ekangami naino te na dossier ya moyekoli.',
    'student.schooling': 'Scolarité',
    'student.mainTeacher': 'Molakisi principal',
    'student.contactViaMessages': 'Solola na Messages',
    'student.mainClassroom': 'Esika ya ba cours',
    'student.cycle': 'Cycle',
    'student.optionNotSet': 'Option etiami te',
    'student.noSubjectAssigned': 'Cours moko te epesami sikoyo.',
    'student.familyContacts': 'Libota mpe contacts',
    'student.guardian': 'Responsable',
    'student.phoneNotSet': 'Téléphone etiami te',
    'student.adminCanComplete': 'Administration ekoki kokokisa dossier oyo.',
    'student.schoolContacts': 'Contacts ya kelasi',
    'student.available': 'ezali',
    'student.adminAndTeacher': 'Administration mpe molakisi principal',
    'student.activeYearMissing': 'Mbula actif ezali te',
    'student.schoolAssignment': 'Affectation ya kelasi',
    'student.secureProfile': 'Profil sécurisé',
    'common.search': 'Luka',
    'common.language': 'Lokota',
    'common.signOut': 'Bima',
    'role.schoolAdmin': 'Bokambi ya eteyelo',
    'layout.campus': 'Campus ya Kigali',
    'layout.title': 'Tablo ya eteyelo',
    'layout.searchPlaceholder': 'Luka bana-kelasi, balakisi, bakelasi',
    'layout.termHealth': 'Ezali ya trimestre',
    'layout.termHealthDetail': 'Bolandi boyei mpe bafuti ezali kosala mpo na trimestre 2.',
    'auth.welcome': 'Boyei malamu lisusu',
    'auth.loginTitle': 'Kota na eteyelo na yo',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.signingIn': 'Ezali kokota...',
    'auth.signIn': 'Kota',
    'auth.newSchool': 'Eteyelo ya sika?',
    'auth.registerSchool': 'Komisa eteyelo na yo',
    'auth.startWorkspace': 'Bandá esika na yo',
    'auth.registerTitle': 'Komisa eteyelo',
    'auth.createWorkspace': 'Salá esika ya eteyelo',
    'auth.creatingWorkspace': 'Ezali kosala esika...',
    'dashboard.commandCenter': 'Centre ya bokambi ya eteyelo',
    'dashboard.heroTitle': 'Kamba mokolo ya eteyelo na esika moko ya polele.',
    'dashboard.heroBody': 'Landá boyei, bafuti, bakelasi mpe bansango ya mabota na mbangu ya SaaS ya Afrika ya sika.',
    'dashboard.today': 'Lelo',
    'dashboard.openTasks': 'Misala efungwami',
    'dashboard.quickActions': 'Misala ya mbangu',
    'dashboard.adminShortcuts': 'Nzela ya mbangu ya admin',
    'dashboard.registerStudent': 'Komisa mwana-kelasi',
    'dashboard.recordPayment': 'Koma lifuti',
    'dashboard.sendMessage': 'Tinda nsango',
    'dashboard.markAttendance': 'Tia boyei',
    'dashboard.totalStudents': 'Motango ya bana-kelasi',
    'dashboard.totalTeachers': 'Motango ya balakisi',
    'dashboard.totalClasses': 'Motango ya bakelasi',
    'dashboard.attendanceToday': 'Boyei ya lelo',
    'dashboard.pendingPayments': 'Bafuti ezali kozela',
    'dashboard.recentNotifications': 'Biyebisi ya sika',
    'dashboard.payments': 'Bafuti',
    'dashboard.paymentFollowUp': 'Bolandi bafuti ezali kozela',
    'dashboard.attendance': 'Boyei',
    'dashboard.todayByStatus': 'Lelo na ezalela',
    'dashboard.noNotifications': 'Biyebisi ya sika ezali te',
    'dashboard.noNotificationsDetail': 'Bansango ya API ekomonana awa.',
    'mobile.goodDay': 'Mbote',
    'mobile.connected': 'Centre mobile ekangami na API moko ya EVOYAMWANA.',
    'mobile.todayFromDb': 'Lelo uta PostgreSQL'
  },
  lua: {
    'nav.dashboard': 'Tshibangu tshia mudimu',
    'nav.students': 'Bana ba kalasa',
    'nav.teachers': 'Balongi',
    'nav.parents': 'Bavyele',
    'nav.classes': 'Makalasa',
    'nav.attendance': 'Kufika',
    'nav.grades': 'Manota',
    'nav.payments': 'Difuta',
    'nav.messages': 'Mikanda',
    'nav.settings': 'Milongelu',
    'grades.workspace': 'Tshibanza tshia mudimu',
    'grades.title': 'Manota',
    'grades.description': 'Londa mimekano, batrimestre, coefficients ne bukokeshi bua bana ku API umue.',
    'grades.add': 'Tula note',
    'grades.learners': 'Bana',
    'grades.learnersDetail': 'Bana badi ne manota',
    'grades.average': 'Moyenne',
    'grades.averageDetail': 'Moyenne wa mwana',
    'grades.weightedAverage': 'Moyenne coeff.',
    'grades.weightedDetail': 'Ne coefficients',
    'grades.term': 'Trimestre',
    'grades.termDetail': 'Filtre wa mpindieu',
    'grades.searchPlaceholder': 'Keba mwana, kalasa, cours to commentaire',
    'grades.student': 'Mwana',
    'grades.class': 'Kalasa',
    'grades.courses': 'Cours',
    'grades.notes': 'Manota',
    'grades.avgPoints': 'Moyenne wa points',
    'grades.performance': 'Performance',
    'grades.profile': 'Profil',
    'grades.viewNotes': 'Mona manota',
    'grades.emptyTitle': 'Kakuena manota',
    'grades.emptyDescription': 'Tula note to longolola filtres.',
    'grades.page': 'Dibeji',
    'grades.of': 'pa',
    'grades.previous': 'Wa kumutu',
    'grades.next': 'Wa kunyima',
    'grades.all': 'Bionso',
    'grades.loadError': 'Manota kaakoki kulowoda',
    'gradeForm.assessment': 'Evaluation',
    'gradeForm.title': 'Tula note',
    'gradeForm.class': 'Kalasa',
    'gradeForm.selectClass': 'Pona kalasa',
    'gradeForm.student': 'Mwana',
    'gradeForm.selectStudent': 'Pona mwana',
    'gradeForm.subject': 'Cours',
    'gradeForm.selectSubject': 'Pona cours',
    'gradeForm.score': 'Points ipeta',
    'gradeForm.maxScore': 'Total possible',
    'gradeForm.coefficient': 'Coefficient',
    'gradeForm.term': 'Trimestre',
    'gradeForm.comment': 'Commentaire',
    'gradeForm.cancel': 'Futa',
    'gradeForm.saving': 'Kubomba...',
    'gradeForm.submit': 'Bomba note',
    'gradeForm.error': 'Note kayi kubombama',
    'student.back': 'Vutuka ku bana',
    'student.unavailable': 'Mwana kena',
    'student.notFound': 'Dossier wa mwana kawumoniki.',
    'student.active': 'Mwana wa active',
    'student.inactive': 'Mwana wa inactive',
    'student.average': 'Moyenne',
    'student.averageDetail': 'Cours yonso ne coefficients',
    'student.coursesEvaluated': 'Cours idi balua',
    'student.coursesDetail': 'Cours idi ne manota',
    'student.notesDetail': 'Points ikomama',
    'student.details': 'Makambo a mwana',
    'student.gender': 'Genre',
    'student.birthDate': 'Dituku dia kuledibua',
    'student.class': 'Kalasa',
    'student.schoolId': 'ID wa kalasa',
    'student.parents': 'Bavyele ne bakambi',
    'student.noPhone': 'Telephone kayi komama',
    'student.noGuardian': 'Mukambi kena',
    'student.noGuardianDetail': 'Kangisha muvyele mu formulaire wa kulongolola mwana.',
    'student.annualEvolution': 'Bukoli bua mwaka',
    'student.termAverage': 'Moyenne mu trimestre',
    'student.annual': 'wa mwaka',
    'student.pointsByCourse': 'Points pa cours',
    'student.allGrades': 'Manota onso a mwana',
    'student.emptyGrades': 'Kakuena manota',
    'student.emptyGradesDetail': 'Manota a cours yonso ne amoneka apa.',
    'student.course': 'Cours',
    'student.points': 'Points',
    'student.notSet': 'Kayi teka',
    'student.unassigned': 'Kayi peshibua',
    'student.loadError': 'Mwana kayi kulowoda',
    'student.space': 'Tshibanza tshia mwana',
    'student.myCourses': 'Malongi ami',
    'student.myCoursesDescription': 'Tala malongi a kalasa kuebe, balongi ne mayele a kalasa.',
    'student.loadCoursesError': 'Malongi ebe kayi kulowoda.',
    'student.classLinked': 'Kalasa kakangane ne profil webe',
    'student.programSubjects': 'Malongi a programme webe',
    'student.associatedTeachers': 'Balongi bakangane',
    'student.searchCourse': 'Sosa dilongi',
    'student.noCoursesFound': 'Dilongi kayi dimoneka',
    'student.noCoursesDetail': 'Malongi a kalasa kuebe akamoneka apa kalasa pakupesha.',
    'student.room': 'Salle',
    'student.unassignedClass': 'Kalasa kayi peshibua',
    'student.finalizeAssignment': 'Solola ne kalasa bua kujikija affectation.',
    'student.myGrades': 'Manota ami',
    'student.myGradesDescription': 'Tala points yebe, moyenne ne dikola dia mwaka.',
    'student.loadGradesError': 'Manota ebe kayi kulowoda.',
    'student.currentAverage': 'Moyenne wa lelu',
    'student.evaluatedCourses': 'Malongi apeshibue manota',
    'student.subjectsWithPoints': 'Malongi ne points',
    'student.recordedAssessments': 'Evaluations ekomami',
    'student.searchCourseComment': 'Sosa dilongi to commentaire',
    'student.allTerms': 'Trimestres yonso',
    'student.evolution': 'Dikola',
    'student.averageByTerm': 'Moyenne pa trimestre',
    'student.noGradesFound': 'Kakuena manota amoneka',
    'student.noGradesDetail': 'Manota ebe akamoneka apa mulongi pakukoma.',
    'student.coefficient': 'Coeff.',
    'student.myAttendance': 'Kufika kwami',
    'student.myAttendanceDescription': 'Tala kufika, kuchedilwa ne maloba a kalasa.',
    'student.loadAttendanceError': 'Kufika kwebe kayi kulowoda.',
    'student.personalAttendance': 'Kufika kua muntu',
    'student.attendanceRate': 'Taux wa kufika',
    'student.confirmedPresence': 'Kufika kushimishibue',
    'student.present': 'Ufiki',
    'student.absent': 'Kayi ufiki',
    'student.late': 'Uchedile',
    'student.excused': 'Ulekedibue',
    'student.presentDays': 'Matuku afiki',
    'student.lateArrivals': 'Kuchedilwa kukomami',
    'student.recordedAbsences': 'Kukonda kufika kukomami',
    'student.recentDays': 'Matuku a nsombelu',
    'student.noAttendance': 'Kufika kuena',
    'student.noAttendanceDetail': 'Historique webe ukamoneka apa panyima pa appel.',
    'student.searchAttendance': 'Sosa date, kalasa to note',
    'student.allStatuses': 'Statuts yonso',
    'student.date': 'Date',
    'student.status': 'Statut',
    'student.observation': 'Observation',
    'student.noComment': 'Commentaire kuena',
    'student.noAttendanceFound': 'Kufika kayi kumoneka',
    'student.noAttendanceFoundDetail': 'Shintulula filtre to lindila kalasa akoma kufika.',
    'student.myMessages': 'Mikanda yami',
    'student.myMessagesDescription': 'Tala nsangu ya mushinga ne solola ne bukokeshi to mulongi.',
    'student.loadMessagesError': 'Mikanda yebe kayi kulowoda.',
    'student.loadConversationError': 'Conversation kayi kulowoda.',
    'student.sendMessageError': 'Kutuma mukanda uku kayi kulue.',
    'student.secureSchoolMessaging': 'Messagerie ya kalasa mu sécurité',
    'student.conversations': 'Masolo',
    'student.allowedContacts': 'Contacts bapeshami',
    'student.unread': 'Kayi tangibue',
    'student.messagesToRead': 'Mikanda ya kutanga',
    'student.access': 'Accès',
    'student.securedAccess': 'Mu sécurité',
    'student.schoolTeacherOnly': 'Kalasa ne mulongi pabo',
    'student.searchContact': 'Sosa contact',
    'student.noContact': 'Contact kuena',
    'student.noContactDetail': 'Contacts yebe ikamoneka apa kalasa pakuyivula.',
    'student.conversation': 'Conversation',
    'student.selectContact': 'Sola contact',
    'student.noMessage': 'Mukanda kuena',
    'student.noMessageDetail': 'Tshibangila conversation mufupi ne muakane.',
    'student.chooseContact': 'Sola contact',
    'student.chooseContactDetail': 'Sola bukokeshi to mulongi bua kuvula conversation.',
    'student.writeTo': 'Komela',
    'student.schoolAdmin': 'Bukokeshi',
    'student.superAdmin': 'Super admin',
    'student.teacherRole': 'Mulongi',
    'student.parentRole': 'Muvyele',
    'student.studentRole': 'Mwana',
    'student.myProfile': 'Profil wami',
    'student.myProfileDescription': 'Mayele ebe, kalasa, bavyele ne accès ya kalasa.',
    'student.loadProfileError': 'Profil webe kayi kulowoda.',
    'student.studentCode': 'Code wa mwana',
    'student.identity': 'Identité',
    'student.accountEmail': 'E-mail wa compte',
    'student.profileNotFound': 'Profil kayi mumoneka',
    'student.profileNotFoundDetail': 'Compte ewu kayi ukangane ne dossier wa mwana.',
    'student.schooling': 'Kalasa',
    'student.mainTeacher': 'Mulongi mukulu',
    'student.contactViaMessages': 'Solola na Messages',
    'student.mainClassroom': 'Tshibanza tshia malongi',
    'student.cycle': 'Cycle',
    'student.optionNotSet': 'Option kayi teka',
    'student.noSubjectAssigned': 'Dilongi kayi peshibua lelu.',
    'student.familyContacts': 'Diku ne contacts',
    'student.guardian': 'Mukulu',
    'student.phoneNotSet': 'Telephone kayi teka',
    'student.adminCanComplete': 'Bukokeshi buakokesha dossier ewu.',
    'student.schoolContacts': 'Contacts ya kalasa',
    'student.available': 'bidi',
    'student.adminAndTeacher': 'Bukokeshi ne mulongi mukulu',
    'student.activeYearMissing': 'Mwaka actif kuena',
    'student.schoolAssignment': 'Affectation ya kalasa',
    'student.secureProfile': 'Profil mu sécurité',
    'common.search': 'Keba',
    'common.language': 'Muakulu',
    'common.signOut': 'Bima',
    'role.schoolAdmin': 'Bukokeshi bua kalasa',
    'layout.campus': 'Campus wa Kigali',
    'layout.title': 'Tshibangu tshia kalasa',
    'layout.searchPlaceholder': 'Keba bana, balongi, makalasa',
    'layout.termHealth': 'Moyo wa trimestre',
    'layout.termHealthDetail': 'Kulonda kufika ne difuta bidi bikola mu trimestre 2.',
    'auth.welcome': 'Waya kabidi',
    'auth.loginTitle': 'Kota mu kalasa yebe',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.signingIn': 'Tukota...',
    'auth.signIn': 'Kota',
    'auth.newSchool': 'Kalasa mupia?',
    'auth.registerSchool': 'Sangisha kalasa yebe',
    'auth.startWorkspace': 'Tshibangidila tshibanza',
    'auth.registerTitle': 'Sangisha kalasa',
    'auth.createWorkspace': 'Vanga tshibanza tshia kalasa',
    'auth.creatingWorkspace': 'Tuvanga tshibanza...',
    'dashboard.commandCenter': 'Centre wa bukokeshi bua kalasa',
    'dashboard.heroTitle': 'Longolola dituku dia kalasa mu tshibanza tshimue tshia patoke.',
    'dashboard.heroBody': 'Londa kufika, difuta, makalasa ne mikanda ya mavyele ku bukole bua SaaS wa Afrika.',
    'dashboard.today': 'Lelu',
    'dashboard.openTasks': 'Midimu mikanguka',
    'dashboard.quickActions': 'Midimu ya lukasa',
    'dashboard.adminShortcuts': 'Njila ya lukasa ya admin',
    'dashboard.registerStudent': 'Sangisha mwana',
    'dashboard.recordPayment': 'Koma difuta',
    'dashboard.sendMessage': 'Tuma mukanda',
    'dashboard.markAttendance': 'Teka kufika',
    'dashboard.totalStudents': 'Bana bonsu',
    'dashboard.totalTeachers': 'Balongi bonsu',
    'dashboard.totalClasses': 'Makalasa onso',
    'dashboard.attendanceToday': 'Kufika kwa lelu',
    'dashboard.pendingPayments': 'Mafuta adi alindila',
    'dashboard.recentNotifications': 'Biyebisi bia nsombelu',
    'dashboard.payments': 'Difuta',
    'dashboard.paymentFollowUp': 'Kulonda mafuta adi alindila',
    'dashboard.attendance': 'Kufika',
    'dashboard.todayByStatus': 'Lelu pa muoyo',
    'dashboard.noNotifications': 'Kakuena biyebisi bia nsombelu',
    'dashboard.noNotificationsDetail': 'Mikanda ya API ne imoneka apa.',
    'mobile.goodDay': 'Moyo',
    'mobile.connected': 'Centre mobile udi ku API umue wa EVOYAMWANA.',
    'mobile.todayFromDb': 'Lelu ku PostgreSQL'
  },
  kg: {
    'nav.dashboard': 'Taulu ya kisalu',
    'nav.students': 'Balongoki',
    'nav.teachers': 'Balongi',
    'nav.parents': 'Bibuti',
    'nav.classes': 'Bakilasi',
    'nav.attendance': 'Kukwiza',
    'nav.grades': 'Banota',
    'nav.payments': 'Bifutu',
    'nav.messages': 'Nsangu',
    'nav.settings': 'Biyidika',
    'grades.workspace': 'Kisika ya kisalu',
    'grades.title': 'Banota',
    'grades.description': 'Tadila mimekano, batrimestre, coefficients mpi ngolo ya balongoki katuka na API mosi.',
    'grades.add': 'Yika nota',
    'grades.learners': 'Balongoki',
    'grades.learnersDetail': 'Balongoki yina kele na banota',
    'grades.average': 'Moyenne',
    'grades.averageDetail': 'Moyenne ya nlongoki',
    'grades.weightedAverage': 'Moyenne coeff.',
    'grades.weightedDetail': 'Na coefficients',
    'grades.term': 'Trimestre',
    'grades.termDetail': 'Filtre ya ntangu yayi',
    'grades.searchPlaceholder': 'Sosa nlongoki, kilasi, cours to commentaire',
    'grades.student': 'Nlongoki',
    'grades.class': 'Kilasi',
    'grades.courses': 'Cours',
    'grades.notes': 'Banota',
    'grades.avgPoints': 'Moyenne ya points',
    'grades.performance': 'Performance',
    'grades.profile': 'Profil',
    'grades.viewNotes': 'Tala banota',
    'grades.emptyTitle': 'Banota kele ve',
    'grades.emptyDescription': 'Yika nota to soba filtres.',
    'grades.page': 'Lutiti',
    'grades.of': 'na',
    'grades.previous': 'Ya ntete',
    'grades.next': 'Ya landa',
    'grades.all': 'Yonso',
    'grades.loadError': 'Kukarga banota me lunga ve',
    'gradeForm.assessment': 'Evaluation',
    'gradeForm.title': 'Yika nota',
    'gradeForm.class': 'Kilasi',
    'gradeForm.selectClass': 'Pona kilasi',
    'gradeForm.student': 'Nlongoki',
    'gradeForm.selectStudent': 'Pona nlongoki',
    'gradeForm.subject': 'Cours',
    'gradeForm.selectSubject': 'Pona cours',
    'gradeForm.score': 'Points kubaka',
    'gradeForm.maxScore': 'Total possible',
    'gradeForm.coefficient': 'Coefficient',
    'gradeForm.term': 'Trimestre',
    'gradeForm.comment': 'Commentaire',
    'gradeForm.cancel': 'Katula',
    'gradeForm.saving': 'Ke bomba...',
    'gradeForm.submit': 'Bomba nota',
    'gradeForm.error': 'Kubomba nota me lunga ve',
    'student.back': 'Vutuka na balongoki',
    'student.unavailable': 'Nlongoki kele ve',
    'student.notFound': 'Dossier ya nlongoki monanaka ve.',
    'student.active': 'Nlongoki active',
    'student.inactive': 'Nlongoki inactive',
    'student.average': 'Moyenne',
    'student.averageDetail': 'Cours yonso na coefficients',
    'student.coursesEvaluated': 'Cours yina beto me tala',
    'student.coursesDetail': 'Cours yina kele na banota',
    'student.notesDetail': 'Points kusonika',
    'student.details': 'Makambo ya nlongoki',
    'student.gender': 'Genre',
    'student.birthDate': 'Kilumbu ya kubutuka',
    'student.class': 'Kilasi',
    'student.schoolId': 'ID ya nzo-nkanda',
    'student.parents': 'Bibuti mpi bakengidi',
    'student.noPhone': 'Telefone kusonama ve',
    'student.noGuardian': 'Mukengidi kele ve',
    'student.noGuardianDetail': 'Kangisa mubuti na formulaire ya kusoba nlongoki.',
    'student.annualEvolution': 'Bokoli ya mvula',
    'student.termAverage': 'Moyenne na trimestre',
    'student.annual': 'ya mvula',
    'student.pointsByCourse': 'Points na cours',
    'student.allGrades': 'Banota yonso ya nlongoki',
    'student.emptyGrades': 'Banota kele ve',
    'student.emptyGradesDetail': 'Banota ya cours yonso ta monana awa.',
    'student.course': 'Cours',
    'student.points': 'Points',
    'student.notSet': 'Kutanga ve',
    'student.unassigned': 'Kupesama ve',
    'student.loadError': 'Kukarga nlongoki me lunga ve',
    'student.space': 'Kisika ya nlongoki',
    'student.myCourses': 'Cours na mono',
    'student.myCoursesDescription': 'Tala cours ya kilasi na nge, balongi mpi bansangu ya nzo-nkanda.',
    'student.loadCoursesError': 'Kukarga cours na nge me lunga ve.',
    'student.myGrades': 'Banota na mono',
    'student.myGradesDescription': 'Tala points, moyenne mpi bokoli ya mvula.',
    'student.loadGradesError': 'Kukarga banota na nge me lunga ve.',
    'student.myAttendance': 'Kukwiza na mono',
    'student.myAttendanceDescription': 'Tala histoire ya kukwiza, retard mpi maloba ya nzo-nkanda.',
    'student.loadAttendanceError': 'Kukarga kukwiza na nge me lunga ve.',
    'student.myMessages': 'Nsangu na mono',
    'student.myMessagesDescription': 'Tala bansangu ya mfunu mpi solola ti luyalu to mulongi.',
    'student.loadMessagesError': 'Kukarga nsangu na nge me lunga ve.',
    'student.myProfile': 'Profil na mono',
    'student.myProfileDescription': 'Bansangu na nge, kilasi, bakengidi mpi accès ya nzo-nkanda.',
    'student.loadProfileError': 'Kukarga profil na nge me lunga ve.',
    'student.present': 'Kwiza',
    'student.absent': 'Kukonda',
    'student.late': 'Retard',
    'student.excused': 'Balolula',
    'student.access': 'Accès',
    'student.securedAccess': 'Ya sécurité',
    'student.studentRole': 'Nlongoki',
    'student.teacherRole': 'Mulongi',
    'student.parentRole': 'Mubuti',
    'student.schoolAdmin': 'Luyalu',
    'student.guardian': 'Mukengidi',
    'student.schoolContacts': 'Contacts ya nzo-nkanda',
    'student.studentCode': 'Code ya nlongoki',
    'student.identity': 'Identité',
    'student.schooling': 'Nzo-nkanda',
    'common.search': 'Sosa',
    'common.language': 'Ndinga',
    'common.signOut': 'Basika',
    'role.schoolAdmin': 'Luyalu lwa nzo-nkanda',
    'layout.campus': 'Campus ya Kigali',
    'layout.title': 'Taulu ya nzo-nkanda',
    'layout.searchPlaceholder': 'Sosa balongoki, balongi, bakilasi',
    'layout.termHealth': 'Mavimpi ma trimestre',
    'layout.termHealthDetail': 'Kutadila kukwiza mpi bifutu kele kusala na trimestre 2.',
    'auth.welcome': 'Wiza diaka',
    'auth.loginTitle': 'Kota na nzo-nkanda yaku',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.signingIn': 'Ke kota...',
    'auth.signIn': 'Kota',
    'auth.newSchool': 'Nzo-nkanda ya mpa?',
    'auth.registerSchool': 'Sonika nzo-nkanda yaku',
    'auth.startWorkspace': 'Yantika kisika ya kisalu',
    'auth.registerTitle': 'Sonika nzo-nkanda',
    'auth.createWorkspace': 'Sala kisika ya nzo-nkanda',
    'auth.creatingWorkspace': 'Ke sala kisika...',
    'dashboard.commandCenter': 'Centre ya luyalu lwa nzo-nkanda',
    'dashboard.heroTitle': 'Yala kilumbu ya nzo-nkanda na kisika mosi ya pwelele.',
    'dashboard.heroBody': 'Tadila kukwiza, bifutu, bakilasi mpi nsangu ya mabuta na ngolo ya SaaS ya Afrika ya mpa.',
    'dashboard.today': 'Bubu',
    'dashboard.openTasks': 'Bisalu ya kukanguka',
    'dashboard.quickActions': 'Bisalu ya nswalu',
    'dashboard.adminShortcuts': 'Nzila ya nswalu ya admin',
    'dashboard.registerStudent': 'Sonika nlongoki',
    'dashboard.recordPayment': 'Sonika kifutu',
    'dashboard.sendMessage': 'Tinda nsangu',
    'dashboard.markAttendance': 'Tula kukwiza',
    'dashboard.totalStudents': 'Balongoki yonso',
    'dashboard.totalTeachers': 'Balongi yonso',
    'dashboard.totalClasses': 'Bakilasi yonso',
    'dashboard.attendanceToday': 'Kukwiza ya bubu',
    'dashboard.pendingPayments': 'Bifutu ke vingila',
    'dashboard.recentNotifications': 'Biyebisa ya mpa',
    'dashboard.payments': 'Bifutu',
    'dashboard.paymentFollowUp': 'Kutadila bifutu ke vingila',
    'dashboard.attendance': 'Kukwiza',
    'dashboard.todayByStatus': 'Bubu na mutindu',
    'dashboard.noNotifications': 'Biyebisa ya mpa kele ve',
    'dashboard.noNotificationsDetail': 'Nsangu ya API ta monana awa.',
    'mobile.goodDay': 'Mbote',
    'mobile.connected': 'Centre mobile kele na API mosi ya EVOYAMWANA.',
    'mobile.todayFromDb': 'Bubu katuka PostgreSQL'
  },
  tll: {
    'nav.dashboard': 'Tableau ya mosala',
    'nav.students': 'Bana ba kelasi',
    'nav.teachers': 'Balakisi',
    'nav.parents': 'Baboti',
    'nav.classes': 'Bakelasi',
    'nav.attendance': 'Boyei',
    'nav.grades': 'Manota',
    'nav.payments': 'Bafuti',
    'nav.messages': 'Bansango',
    'nav.settings': 'Mibongisi',
    'grades.workspace': 'Esika ya mosala',
    'grades.title': 'Manota',
    'grades.description': 'Landa mimekano, batrimestre, coefficients mpe bokoli ya bana uta na API moko.',
    'grades.add': 'Bakisa nota',
    'grades.learners': 'Bana',
    'grades.learnersDetail': 'Bana oyo bazali na manota',
    'grades.average': 'Moyenne',
    'grades.averageDetail': 'Moyenne ya mwana',
    'grades.weightedAverage': 'Moyenne coeff.',
    'grades.weightedDetail': 'Na coefficients',
    'grades.term': 'Trimestre',
    'grades.termDetail': 'Filtre ya sikoyo',
    'grades.searchPlaceholder': 'Luka mwana, kelasi, cours to commentaire',
    'grades.student': 'Mwana',
    'grades.class': 'Kelasi',
    'grades.courses': 'Cours',
    'grades.notes': 'Manota',
    'grades.avgPoints': 'Moyenne ya points',
    'grades.performance': 'Performance',
    'grades.profile': 'Profil',
    'grades.viewNotes': 'Tala manota',
    'grades.emptyTitle': 'Manota ezali te',
    'grades.emptyDescription': 'Bakisa nota to bongola ba filtres.',
    'grades.page': 'Lokasa',
    'grades.of': 'na',
    'grades.previous': 'Ya liboso',
    'grades.next': 'Ya sima',
    'grades.all': 'Nyonso',
    'grades.loadError': 'Kokoka te kocharger manota',
    'gradeForm.assessment': 'Evaluation',
    'gradeForm.title': 'Bakisa nota',
    'gradeForm.class': 'Kelasi',
    'gradeForm.selectClass': 'Pona kelasi',
    'gradeForm.student': 'Mwana',
    'gradeForm.selectStudent': 'Pona mwana',
    'gradeForm.subject': 'Cours',
    'gradeForm.selectSubject': 'Pona cours',
    'gradeForm.score': 'Points ezwami',
    'gradeForm.maxScore': 'Total possible',
    'gradeForm.coefficient': 'Coefficient',
    'gradeForm.term': 'Trimestre',
    'gradeForm.comment': 'Commentaire',
    'gradeForm.cancel': 'Longola',
    'gradeForm.saving': 'Ezali kobomba...',
    'gradeForm.submit': 'Bomba nota',
    'gradeForm.error': 'Kobomba nota ekoki te',
    'student.back': 'Zonga na bana',
    'student.unavailable': 'Mwana azali te',
    'student.notFound': 'Dossier ya mwana emonani te.',
    'student.active': 'Mwana active',
    'student.inactive': 'Mwana inactive',
    'student.average': 'Moyenne',
    'student.averageDetail': 'Cours nyonso na coefficients',
    'student.coursesEvaluated': 'Cours etalelami',
    'student.coursesDetail': 'Cours na manota',
    'student.notesDetail': 'Points ekomami',
    'student.details': 'Makambo ya mwana',
    'student.gender': 'Genre',
    'student.birthDate': 'Mokolo ya mbotama',
    'student.class': 'Kelasi',
    'student.schoolId': 'ID ya eteyelo',
    'student.parents': 'Baboti mpe bakambi',
    'student.noPhone': 'Telephone ekomami te',
    'student.noGuardian': 'Mokambi moko te',
    'student.noGuardianDetail': 'Kangisa moboti na formulaire ya kobongisa mwana.',
    'student.annualEvolution': 'Bokoli ya mobu',
    'student.termAverage': 'Moyenne na trimestre',
    'student.annual': 'ya mobu',
    'student.pointsByCourse': 'Points na cours',
    'student.allGrades': 'Manota nyonso ya mwana',
    'student.emptyGrades': 'Manota ezali te',
    'student.emptyGradesDetail': 'Manota ya cours nyonso ekomonana awa.',
    'student.course': 'Cours',
    'student.points': 'Points',
    'student.notSet': 'Etyami te',
    'student.unassigned': 'Epesami te',
    'student.loadError': 'Kokoka te kocharger mwana',
    'student.space': 'Espace ya mwana',
    'student.myCourses': 'Ba cours na ngai',
    'student.myCoursesDescription': 'Tala ba matières ya classe na yo, balakisi mpe bansango ya kelasi.',
    'student.loadCoursesError': 'Kokoka te kocharger ba cours na yo.',
    'student.myGrades': 'Ba notes na ngai',
    'student.myGradesDescription': 'Tala ba points, moyenne mpe évolution ya mbula.',
    'student.loadGradesError': 'Kokoka te kocharger ba notes na yo.',
    'student.myAttendance': 'Présences na ngai',
    'student.myAttendanceDescription': 'Tala historique ya présence, retard mpe observations ya kelasi.',
    'student.loadAttendanceError': 'Kokoka te kocharger présences na yo.',
    'student.myMessages': 'Ba messages na ngai',
    'student.myMessagesDescription': 'Tala ba annonces ya ntina mpe solola na administration to molakisi.',
    'student.loadMessagesError': 'Kokoka te kocharger ba messages na yo.',
    'student.myProfile': 'Profil na ngai',
    'student.myProfileDescription': 'Ba informations na yo, classe, responsables mpe accès ya kelasi.',
    'student.loadProfileError': 'Kokoka te kocharger profil na yo.',
    'student.present': 'Azali',
    'student.absent': 'Azangi',
    'student.late': 'Retard',
    'student.excused': 'Excusé',
    'student.access': 'Accès',
    'student.securedAccess': 'Sécurisé',
    'student.studentRole': 'Mwana',
    'student.teacherRole': 'Molakisi',
    'student.parentRole': 'Moboti',
    'student.schoolAdmin': 'Administration',
    'student.guardian': 'Mokambi',
    'student.schoolContacts': 'Contacts ya kelasi',
    'student.studentCode': 'Code ya mwana',
    'student.identity': 'Identité',
    'student.schooling': 'Scolarité',
    'common.search': 'Luka',
    'common.language': 'Lokota',
    'common.signOut': 'Bima',
    'role.schoolAdmin': 'Bokambi ya eteyelo',
    'layout.campus': 'Campus ya Kigali',
    'layout.title': 'Tableau ya eteyelo',
    'layout.searchPlaceholder': 'Luka bana, balakisi, bakelasi',
    'layout.termHealth': 'Santé ya trimestre',
    'layout.termHealthDetail': 'Bolandi boyei mpe bafuti ezali kosala na trimestre 2.',
    'auth.welcome': 'Boyei malamu lisusu',
    'auth.loginTitle': 'Kota na eteyelo na yo',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.signingIn': 'Ezali kokota...',
    'auth.signIn': 'Kota',
    'auth.newSchool': 'Eteyelo ya sika?',
    'auth.registerSchool': 'Komisa eteyelo na yo',
    'auth.startWorkspace': 'Bandá esika na yo',
    'auth.registerTitle': 'Komisa eteyelo',
    'auth.createWorkspace': 'Salá esika ya eteyelo',
    'auth.creatingWorkspace': 'Ezali kosala esika...',
    'dashboard.commandCenter': 'Centre ya bokambi ya eteyelo',
    'dashboard.heroTitle': 'Kamba mokolo ya eteyelo na esika moko ya polele.',
    'dashboard.heroBody': 'Landá boyei, bafuti, bakelasi mpe bansango ya mabota na mbangu ya SaaS ya Afrika.',
    'dashboard.today': 'Lelo',
    'dashboard.openTasks': 'Misala efungwami',
    'dashboard.quickActions': 'Misala ya mbangu',
    'dashboard.adminShortcuts': 'Nzela ya mbangu ya admin',
    'dashboard.registerStudent': 'Komisa mwana',
    'dashboard.recordPayment': 'Koma lifuti',
    'dashboard.sendMessage': 'Tinda nsango',
    'dashboard.markAttendance': 'Tia boyei',
    'dashboard.totalStudents': 'Motango ya bana',
    'dashboard.totalTeachers': 'Motango ya balakisi',
    'dashboard.totalClasses': 'Motango ya bakelasi',
    'dashboard.attendanceToday': 'Boyei ya lelo',
    'dashboard.pendingPayments': 'Bafuti ezali kozela',
    'dashboard.recentNotifications': 'Biyebisi ya sika',
    'dashboard.payments': 'Bafuti',
    'dashboard.paymentFollowUp': 'Bolandi bafuti ezali kozela',
    'dashboard.attendance': 'Boyei',
    'dashboard.todayByStatus': 'Lelo na ezalela',
    'dashboard.noNotifications': 'Biyebisi ya sika ezali te',
    'dashboard.noNotificationsDetail': 'Bansango ya API ekomonana awa.',
    'mobile.goodDay': 'Mbote',
    'mobile.connected': 'Centre mobile ekangami na API moko ya EVOYAMWANA.',
    'mobile.todayFromDb': 'Lelo uta PostgreSQL'
  }
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof translations.fr;

export const translate = (locale: Locale, key: TranslationKey) => (translations[locale] as Record<string, string>)[key] ?? translations.fr[key];

export interface SchoolSummary {
  id: string;
  name: string;
  country: string;
  city: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId: string | null;
  schoolName?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface StudentDto {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  gender?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  nationality?: string | null;
  photoUrl?: string | null;
  studentCode: string;
  category?: StudentCategory;
  classId?: string | null;
  schoolYearId?: string | null;
  status?: 'active' | 'inactive' | 'transferred' | 'graduated';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: string;
    name: string;
    level: string;
    section?: string | null;
  } | null;
  parents?: Array<{
    parent: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
    };
  }>;
  guardians?: Array<{
    guardianId?: string;
    relationshipType?: 'father' | 'mother' | 'guardian' | 'tutor' | 'other';
    isPrimaryContact?: boolean;
    emergencyContact?: boolean;
    canPickUpChild?: boolean;
    guardian?: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
    };
  }>;
  medicalInfo?: {
    bloodType?: string | null;
    allergies?: string | null;
    chronicDiseases?: string | null;
    medication?: string | null;
    doctorName?: string | null;
    doctorPhone?: string | null;
    emergencyNotes?: string | null;
  } | null;
}

export interface TeacherDto {
  id: string;
  schoolId: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  gender?: string | null;
  nationality?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  hireDate?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  nationalId?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  bio?: string | null;
  employmentStatus?: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  classes?: Array<{
    id: string;
    name: string;
    level: string;
    section?: string | null;
    academicYear: string;
  }>;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export type TeacherEmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export interface TeacherProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeNumber?: string;
  phone?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  gender?: string | null;
  nationality?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  hireDate?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  nationalId?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  bio?: string | null;
  employmentStatus?: TeacherEmploymentStatus;
  password?: string;
}

export interface ParentDto {
  id: string;
  schoolId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  children?: Array<{
    relationship: string;
    isPrimary: boolean;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      studentCode: string;
      class?: {
        id: string;
        name: string;
      } | null;
    };
  }>;
}

export interface ClassDto {
  id: string;
  schoolId: string;
  teacherId?: string | null;
  name: string;
  level: string;
  section?: string | null;
  academicYear: string;
  room?: string | null;
  capacity?: number | null;
  cycle?: string | null;
  option?: string | null;
  shift?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    user?: {
      email: string;
    };
  } | null;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
  }>;
  _count?: {
    students: number;
    subjects: number;
  };
}

export interface MessageDto {
  id: string;
  schoolId: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  status: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
  recipient?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}

export interface GradeDto {
  id: string;
  schoolId: string;
  studentId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  assignmentId?: string | null;
  score: string;
  maxScore: string;
  coefficient: string;
  term: string;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
    level: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface StudentGradeSummaryDto {
  studentId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
  };
  class?: {
    id: string;
    name: string;
    level: string;
  };
  term?: string;
  gradeCount: number;
  subjectCount: number;
  averagePercent: number;
  weightedAveragePercent: number;
  totalScore: number;
  totalMaxScore: number;
}

export interface StudentGradeMetricsDto {
  evaluatedStudents: number;
  gradeCount: number;
  subjectCount: number;
  classCount: number;
  averagePercent: number | null;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export interface PaymentDto {
  id: string;
  schoolId: string;
  studentId: string;
  parentId?: string | null;
  amount: string;
  amountPaid: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  receiptNumber?: string | null;
  description?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
    class?: {
      id: string;
      name: string;
      level: string;
    } | null;
  };
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  } | null;
}

export interface AttendanceDto {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  student?: StudentDto;
  class?: {
    id: string;
    name: string;
    level: string;
    section?: string | null;
  } | null;
}

export interface ClassAttendanceDto {
  students: StudentDto[];
  attendance: AttendanceDto[];
}

export interface DashboardSummaryDto {
  totals: {
    students: number;
    teachers: number;
    classes: number;
    attendanceToday: number;
    pendingPayments: number;
    notifications: number;
  };
  attendance: Record<AttendanceStatus | 'total', number> & {
    rate: number;
  };
  pendingPayments: Array<{
    id: string;
    amount: string;
    amountPaid: string;
    dueDate: string;
    status: string;
    paymentMethod?: string | null;
    receiptNumber?: string | null;
    student?: {
      firstName: string;
      lastName: string;
      studentCode: string;
    };
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    readAt?: string | null;
    createdAt: string;
  }>;
  collaboratorDossiers: Array<{
    id: string;
    title: string;
    owner?: string | null;
    status: string;
    priority: string;
    dueDate?: string | null;
    updatedAt: string;
  }>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  details?: unknown;
}

export const API_ROUTES = {
  health: '/health',
  auth: {
    login: '/auth/login',
    registerSchool: '/auth/register-school',
    me: '/auth/me',
    logout: '/auth/logout'
  },
  students: '/students',
  teachers: '/teachers',
  parents: '/parents',
  classes: '/classes',
  subjects: '/subjects',
  schoolYears: '/school-years',
  timetable: '/timetable',
  assignments: '/assignments',
  fees: '/fees',
  grades: '/grades',
  messages: '/messages',
  payments: '/payments',
  platform: '/platform',
  attendance: '/attendance',
  schoolHealth: '/school-health',
  sectorDossiers: '/sector-dossiers',
  directorReports: '/director-reports',
  staffUsers: '/staff-users',
  dashboard: '/dashboard'
} as const;
