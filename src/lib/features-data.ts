import {
  Users,
  Calendar,
  MessageCircle,
  CreditCard,
  Activity,
  Apple,
  ClipboardList,
  Wrench,
  CalendarCheck,
  TrendingUp,
  Dumbbell,
  Image,
  FileText,
  UserCheck,
  type LucideIcon
} from 'lucide-react';

export type BadgeType = 'popular' | 'new' | 'premium' | 'best_seller' | 'exclusive' | 'recommended' | 'hot';
export type ModuleCategory = 'operations' | 'marketing' | 'sales' | 'clients';

export interface Testimonial {
  gymName: string;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface ModuleMetadata {
  code: string;
  displayName: string;
  tagline: string;
  longDescription: string;
  icon: LucideIcon;
  category: ModuleCategory;
  benefits: string[];
  socialProof: {
    estimatedGymsUsing: number;
    rating: number;
    reviewsCount: number;
    activationsThisWeek: number;
  };
  badges: BadgeType[];
  fomoMessages: string[];
  pricing?: {
    monthlyPrice: number;
    annualPrice: number;
    trialDays: number;
  };
  testimonials: Testimonial[];
}

export const MODULES_METADATA: Record<string, ModuleMetadata> = {
  users: {
    code: 'users',
    displayName: 'Gestión de Usuarios',
    tagline: 'Administra miembros y entrenadores fácilmente',
    longDescription: 'Sistema completo para gestionar tu comunidad de miembros, entrenadores y staff. Perfiles detallados, roles y permisos.',
    icon: Users,
    category: 'operations',
    benefits: [
      'Perfiles completos con foto y datos de contacto',
      'Sistema de roles y permisos por gimnasio',
      'Invitaciones automáticas por email'
    ],
    socialProof: {
      estimatedGymsUsing: 12487,
      rating: 4.7,
      reviewsCount: 1843,
      activationsThisWeek: 156
    },
    badges: ['popular'],
    fomoMessages: [
      '👥 Más de 12,000 gimnasios gestionan sus usuarios con nosotros',
      '⭐ 4.7/5 estrellas de satisfacción',
      '🚀 156 gimnasios activaron esto esta semana'
    ],
    testimonials: [
      {
        gymName: 'PowerFit México',
        quote: 'La gestión de usuarios nunca fue tan fácil',
        author: 'Carlos Mendoza',
        role: 'Owner'
      }
    ]
  },

  schedule: {
    code: 'schedule',
    displayName: 'Clases y Horarios',
    tagline: 'Organiza tus clases y horarios al detalle',
    longDescription: 'Sistema completo de programación con categorías, clases, sesiones y plantillas de horarios.',
    icon: Calendar,
    category: 'operations',
    benefits: [
      'Categorías personalizadas para tus clases',
      'Sesiones con capacidad y lista de espera',
      'Plantillas semanales y días especiales'
    ],
    socialProof: {
      estimatedGymsUsing: 11234,
      rating: 4.8,
      reviewsCount: 1654,
      activationsThisWeek: 189
    },
    badges: ['popular', 'recommended'],
    fomoMessages: [
      '📅 11,234 gimnasios organizan sus horarios con nosotros',
      '⚡ 189 activaciones esta semana',
      '🎯 Reduce cancelaciones hasta 35%'
    ],
    testimonials: [
      {
        gymName: 'CrossFit Central',
        quote: 'Nuestras clases siempre están llenas gracias a este sistema',
        author: 'Ana Rodríguez',
        role: 'Head Coach'
      }
    ]
  },

  events: {
    code: 'events',
    displayName: 'Eventos del Gimnasio',
    tagline: 'Crea eventos épicos que tus miembros amarán',
    longDescription: 'Organiza eventos especiales, competencias y actividades grupales con sistema de pagos integrado.',
    icon: Calendar,
    category: 'marketing',
    benefits: [
      'Eventos con cupos limitados y pagos',
      'Chat grupal integrado por evento',
      'Dashboard de pagos y asistencia'
    ],
    socialProof: {
      estimatedGymsUsing: 8923,
      rating: 4.6,
      reviewsCount: 1234,
      activationsThisWeek: 134
    },
    badges: ['popular'],
    fomoMessages: [
      '🎉 8,923 gimnasios crean eventos memorables',
      '💰 Promedio de $15,000 MXN por evento',
      '📈 +250% más participación vs métodos tradicionales'
    ],
    testimonials: [
      {
        gymName: 'Elite Fitness',
        quote: 'Nuestros eventos ahora generan ingresos adicionales significativos',
        author: 'Roberto Sánchez',
        role: 'Director'
      }
    ]
  },

  chat: {
    code: 'chat',
    displayName: 'Mensajería en Tiempo Real',
    tagline: 'Comunícate al instante con tu comunidad',
    longDescription: 'Sistema de chat estilo Messenger con conversaciones personales y grupales en tiempo real.',
    icon: MessageCircle,
    category: 'clients',
    benefits: [
      'Chat 1 a 1 con miembros y entrenadores',
      'Rooms grupales para eventos y clases',
      'Notificaciones push en tiempo real'
    ],
    socialProof: {
      estimatedGymsUsing: 7456,
      rating: 4.5,
      reviewsCount: 982,
      activationsThisWeek: 98
    },
    badges: [],
    fomoMessages: [
      '💬 Más de 500,000 mensajes enviados al día',
      '⚡ Respuesta promedio en menos de 5 minutos',
      '🎯 Aumenta retención de clientes hasta 40%'
    ],
    testimonials: [
      {
        gymName: 'FitZone',
        quote: 'La comunicación con nuestros miembros nunca fue tan fluida',
        author: 'María González',
        role: 'Manager'
      }
    ]
  },

  billing: {
    code: 'billing',
    displayName: 'Pagos y Facturación',
    tagline: 'Cobra membresías de forma automática',
    longDescription: 'Integración completa con Stripe para pagos recurrentes, suscripciones y facturación automática.',
    icon: CreditCard,
    category: 'sales',
    benefits: [
      'Pagos recurrentes automáticos con Stripe',
      'Links de pago compartibles',
      'Dashboard de ingresos en tiempo real'
    ],
    socialProof: {
      estimatedGymsUsing: 6789,
      rating: 4.9,
      reviewsCount: 1456,
      activationsThisWeek: 167
    },
    badges: ['popular', 'recommended'],
    fomoMessages: [
      '💰 Procesa más de $50M MXN al mes',
      '⭐ Módulo mejor calificado (4.9/5)',
      '🚀 Reduce morosidad hasta 65%'
    ],
    testimonials: [
      {
        gymName: 'Sparta Training',
        quote: 'Recuperamos el 100% de nuestros pagos desde que activamos billing',
        author: 'Luis Martínez',
        role: 'Owner'
      }
    ]
  },

  health: {
    code: 'health',
    displayName: 'Tracking de Salud',
    tagline: 'Monitorea la salud de tus clientes',
    longDescription: 'Sistema de seguimiento de medidas corporales, métricas de salud y evolución física.',
    icon: Activity,
    category: 'clients',
    benefits: [
      'Registro de peso, medidas y grasa corporal',
      'Gráficas de evolución en el tiempo',
      'Alertas de objetivos alcanzados'
    ],
    socialProof: {
      estimatedGymsUsing: 5432,
      rating: 4.4,
      reviewsCount: 876,
      activationsThisWeek: 87
    },
    badges: [],
    fomoMessages: [
      '📊 Más de 250,000 mediciones registradas',
      '🎯 Miembros con tracking tienen 2x más adherencia',
      '💪 Resultados visibles motivan continuidad'
    ],
    testimonials: [
      {
        gymName: 'Body Transform',
        quote: 'Nuestros clientes aman ver su progreso en números',
        author: 'Patricia Ruiz',
        role: 'Nutrióloga'
      }
    ]
  },

  nutrition: {
    code: 'nutrition',
    displayName: 'Planes Nutricionales con IA',
    tagline: 'Genera dietas personalizadas en segundos',
    longDescription: 'Sistema avanzado de planes nutricionales con generación asistida por IA, análisis de macros y recetas.',
    icon: Apple,
    category: 'clients',
    benefits: [
      'Genera planes nutricionales con IA en 30 segundos',
      'Tracking de macros y calorías automático',
      'Planes adaptados a objetivos y alergias'
    ],
    socialProof: {
      estimatedGymsUsing: 1847,
      rating: 4.8,
      reviewsCount: 892,
      activationsThisWeek: 127
    },
    badges: ['premium', 'hot', 'best_seller'],
    fomoMessages: [
      '⏰ Oferta especial: Activa hoy y obtén 2 meses gratis',
      '🔥 235 gimnasios lo activaron en los últimos 7 días',
      '⭐ Calificación promedio: 4.8/5 (892 reviews)',
      '🤖 IA entrenada con más de 10,000 planes nutricionales'
    ],
    pricing: {
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      trialDays: 14
    },
    testimonials: [
      {
        gymName: 'PowerFit México',
        quote: 'Ahorramos 10 horas semanales en planificación nutricional',
        author: 'Carlos Mendoza',
        role: 'Owner'
      },
      {
        gymName: 'Elite Performance',
        quote: 'La IA genera planes mejor que yo en una fracción del tiempo',
        author: 'Dr. Jorge Ramírez',
        role: 'Nutriólogo Certificado'
      }
    ]
  },

  surveys: {
    code: 'surveys',
    displayName: 'Encuestas y Feedback',
    tagline: 'Escucha a tus miembros y mejora continuamente',
    longDescription: 'Sistema completo de encuestas con 13 tipos de preguntas, estadísticas y exportación de datos.',
    icon: ClipboardList,
    category: 'marketing',
    benefits: [
      '13 tipos de preguntas (NPS, escala, multiple choice, etc.)',
      'Encuestas anónimas o identificadas',
      'Exportación a Excel/CSV con estadísticas'
    ],
    socialProof: {
      estimatedGymsUsing: 4321,
      rating: 4.6,
      reviewsCount: 654,
      activationsThisWeek: 76
    },
    badges: [],
    fomoMessages: [
      '📊 Más de 100,000 encuestas completadas',
      '💡 Gimnasios que usan surveys mejoran NPS en 23 puntos',
      '🎯 Tasa de respuesta promedio: 67%'
    ],
    testimonials: [
      {
        gymName: 'FitRevolution',
        quote: 'Descubrimos qué querían nuestros clientes y duplicamos retención',
        author: 'Sofía Herrera',
        role: 'Marketing Manager'
      }
    ]
  },

  equipment: {
    code: 'equipment',
    displayName: 'Gestión de Equipos',
    tagline: 'Nunca más pierdas track de tu equipo',
    longDescription: 'Sistema de inventario con códigos QR, alertas de mantenimiento y historial de reparaciones.',
    icon: Wrench,
    category: 'operations',
    benefits: [
      'Inventario completo con códigos QR escaneables',
      'Alertas automáticas de mantenimiento preventivo',
      'Historial de reparaciones y costos'
    ],
    socialProof: {
      estimatedGymsUsing: 423,
      rating: 4.5,
      reviewsCount: 234,
      activationsThisWeek: 67
    },
    badges: ['new'],
    fomoMessages: [
      '🆕 Recién lanzado: Scanner QR para inventario rápido',
      '💰 Ahorra hasta $2,000 USD/mes en mantenimiento',
      '📈 Adopción +150% en el último mes'
    ],
    testimonials: [
      {
        gymName: 'Iron Paradise',
        quote: 'Redujimos costos de mantenimiento en 40% con este módulo',
        author: 'Fernando Castro',
        role: 'Operations Manager'
      }
    ]
  },

  appointments: {
    code: 'appointments',
    displayName: 'Agenda de Citas Inteligente',
    tagline: 'Automatiza el agendamiento de sesiones',
    longDescription: 'Sistema de agendamiento con sincronización de calendarios, recordatorios automáticos y reducción de no-shows.',
    icon: CalendarCheck,
    category: 'operations',
    benefits: [
      'Calendario sincronizado con Google/Outlook',
      'Recordatorios automáticos por WhatsApp/Email',
      'Reduce no-shows hasta 40%'
    ],
    socialProof: {
      estimatedGymsUsing: 1456,
      rating: 4.7,
      reviewsCount: 567,
      activationsThisWeek: 54
    },
    badges: ['popular', 'recommended'],
    fomoMessages: [
      '💪 Gimnasios reportan 40% menos cancelaciones',
      '⏰ Ahorra 5 horas semanales en coordinación',
      '🎯 1,456 gimnasios confían en este sistema'
    ],
    testimonials: [
      {
        gymName: 'Personal Training Pro',
        quote: 'Mis clientes nunca olvidan sus citas ahora',
        author: 'Miguel Ángel Torres',
        role: 'Personal Trainer'
      }
    ]
  },

  progress: {
    code: 'progress',
    displayName: 'Tracking de Progreso de Clientes',
    tagline: 'Visualiza resultados, aumenta retención',
    longDescription: 'Sistema de seguimiento de progreso con fotos antes/después, gráficas de evolución y logros gamificados.',
    icon: TrendingUp,
    category: 'clients',
    benefits: [
      'Fotos antes/después con línea de tiempo',
      'Gráficas de peso, medidas y fuerza',
      'Aumenta retención de clientes hasta 60%'
    ],
    socialProof: {
      estimatedGymsUsing: 2103,
      rating: 4.9,
      reviewsCount: 1234,
      activationsThisWeek: 312
    },
    badges: ['popular', 'recommended', 'hot'],
    fomoMessages: [
      '🏆 Gimnasios con Progress tienen 60% más retención',
      '📸 Más de 50,000 transformaciones documentadas',
      '⭐ Módulo mejor calificado junto con Billing (4.9/5)',
      '🔥 312 activaciones este mes'
    ],
    testimonials: [
      {
        gymName: 'TransformFit',
        quote: 'Ver su progreso motiva a nuestros clientes a quedarse más tiempo',
        author: 'Laura Jiménez',
        role: 'Head Coach'
      }
    ]
  },

  classes: {
    code: 'classes',
    displayName: 'Clases Grupales',
    tagline: 'Gestiona clases con capacidad y asistencia',
    longDescription: 'Sistema de clases grupales con límites de capacidad, listas de espera y check-in automático.',
    icon: Dumbbell,
    category: 'operations',
    benefits: [
      'Límites de capacidad con lista de espera',
      'Check-in digital de asistentes',
      'Reportes de ocupación por clase'
    ],
    socialProof: {
      estimatedGymsUsing: 9876,
      rating: 4.7,
      reviewsCount: 1543,
      activationsThisWeek: 145
    },
    badges: ['popular'],
    fomoMessages: [
      '💪 9,876 gimnasios gestionan sus clases con nosotros',
      '📊 Promedio de ocupación: 87%',
      '🎯 Reduce ausentismo hasta 30%'
    ],
    testimonials: [
      {
        gymName: 'Functional Training',
        quote: 'Nuestras clases están siempre al máximo de capacidad',
        author: 'Ricardo Pérez',
        role: 'Instructor Jefe'
      }
    ]
  },

  stories: {
    code: 'stories',
    displayName: 'Historias 24h estilo Instagram',
    tagline: 'Mantén a tus miembros enganchados',
    longDescription: 'Comparte contenido efímero que desaparece en 24 horas para mantener tu comunidad activa y conectada.',
    icon: Image,
    category: 'marketing',
    benefits: [
      'Publica contenido efímero que desaparece en 24h',
      'Aumenta el engagement hasta 300%',
      'Analytics de vistas y interacciones en tiempo real'
    ],
    socialProof: {
      estimatedGymsUsing: 892,
      rating: 4.6,
      reviewsCount: 456,
      activationsThisWeek: 89
    },
    badges: ['new', 'popular', 'hot'],
    fomoMessages: [
      '🎉 Nuevo: Acabamos de lanzar reacciones en tiempo real',
      '📊 Los gimnasios ven +300% engagement en la primera semana',
      '🚀 Únete a 892 gimnasios que ya lo usan',
      '🔥 89 activaciones hoy'
    ],
    testimonials: [
      {
        gymName: 'Urban Fitness',
        quote: 'Nuestros miembros revisan las historias todos los días',
        author: 'Daniela Moreno',
        role: 'Community Manager'
      }
    ]
  },

  posts: {
    code: 'posts',
    displayName: 'Feed Social del Gimnasio',
    tagline: 'Crea tu comunidad interna',
    longDescription: 'Feed social tipo Facebook para tu gimnasio con posts, likes, comentarios y menciones.',
    icon: FileText,
    category: 'marketing',
    benefits: [
      'Feed tipo Facebook para tu comunidad',
      'Likes, comentarios y menciones',
      'Aumenta sentido de pertenencia y retención'
    ],
    socialProof: {
      estimatedGymsUsing: 678,
      rating: 4.6,
      reviewsCount: 345,
      activationsThisWeek: 43
    },
    badges: ['new', 'recommended'],
    fomoMessages: [
      '🌟 Gimnasios reportan +250% más interacción',
      '💬 Más de 100,000 posts publicados este mes',
      '🔥 Trending: Segunda feature más activada esta semana'
    ],
    testimonials: [
      {
        gymName: 'Community Fit',
        quote: 'Creamos una verdadera comunidad, no solo un gimnasio',
        author: 'Andrea López',
        role: 'Founder'
      }
    ]
  },

  attendance: {
    code: 'attendance',
    displayName: 'Control de Asistencia Automático',
    tagline: 'Check-in con QR o reconocimiento facial',
    longDescription: 'Sistema de control de asistencia con códigos QR personalizados y dashboard de frecuencia en tiempo real.',
    icon: UserCheck,
    category: 'operations',
    benefits: [
      'QR codes personalizados por miembro',
      'Dashboard de asistencia en tiempo real',
      'Reportes de frecuencia y patrones de uso'
    ],
    socialProof: {
      estimatedGymsUsing: 1923,
      rating: 4.7,
      reviewsCount: 789,
      activationsThisWeek: 189
    },
    badges: ['popular'],
    fomoMessages: [
      '📊 1,923 gimnasios ya tienen control total de asistencia',
      '⚡ Procesamiento instantáneo sin filas',
      '🎯 Identifica miembros en riesgo de cancelar por baja frecuencia'
    ],
    testimonials: [
      {
        gymName: 'SmartGym',
        quote: 'Identificamos patrones y evitamos cancelaciones a tiempo',
        author: 'Javier Ruiz',
        role: 'Data Analyst'
      }
    ]
  },

  // El modulo de entrenamiento se escribe en ingles (plan §14, decision 4), incluidos sus
  // metadatos, para que la traduccion del panel sea un unico cambio.
  training: {
    code: 'training',
    displayName: 'Training Programs',
    tagline: 'Write a program once, assign it to everyone',
    longDescription: 'Build multi-week programs with blocks, weeks and days, assign them to a client or a group, and read every logged session with estimated 1RM, personal records and adherence.',
    icon: Dumbbell,
    category: 'clients',
    benefits: [
      'Build a 12-week program and duplicate a week in one click',
      'Assign as a private copy or shared with a group',
      'Review every session with comments and personal records'
    ],
    socialProof: {
      estimatedGymsUsing: 0,
      rating: 0,
      reviewsCount: 0,
      activationsThisWeek: 0
    },
    badges: ['new'],
    fomoMessages: [
      'Programs, logs and personal records in one place',
      'Your clients train offline and sync when they are back',
      'Every session reaches you with the deviations marked'
    ],
    testimonials: []
  }
};

export const MODULE_CATEGORIES: Record<ModuleCategory, { name: string; description: string }> = {
  operations: {
    name: 'Operaciones',
    description: 'Herramientas para gestionar el día a día de tu gimnasio'
  },
  marketing: {
    name: 'Marketing',
    description: 'Aumenta engagement y construye comunidad'
  },
  sales: {
    name: 'Ventas',
    description: 'Genera más ingresos y reduce morosidad'
  },
  clients: {
    name: 'Clientes',
    description: 'Mejora la experiencia y retención de tus miembros'
  }
};

export const BADGE_CONFIG: Record<BadgeType, { label: string; className: string; icon?: string }> = {
  popular: {
    label: 'Popular',
    className: 'bg-green-500 text-white animate-pulse'
  },
  new: {
    label: 'Nuevo',
    className: 'bg-orange-500 text-white'
  },
  premium: {
    label: 'Premium',
    className: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
  },
  best_seller: {
    label: 'Más Vendido',
    className: 'bg-blue-600 text-white',
    icon: '⭐'
  },
  exclusive: {
    label: 'Exclusivo',
    className: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
  },
  recommended: {
    label: 'Recomendado',
    className: 'bg-indigo-500 text-white',
    icon: '✓'
  },
  hot: {
    label: 'Hot',
    className: 'bg-red-500 text-white animate-bounce',
    icon: '🔥'
  }
};
