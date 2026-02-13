/* global window */
(function () {

  /* ========================================
     LABELS
  ======================================== */

  const MOD_LABEL = {
    sede: "En sede",
    hogar: "A domicilio",
    virtual: "Virtual en vivo",
    online: "Online",
  };

  /* ========================================
     CONFIG PRINCIPAL
  ======================================== */

  window.MUSICALA_CATALOG = {

    /* ---------- META ---------- */

    meta: {
      whatsappNumber: "573193529475",
      defaultText:
        "Hola Musicala 👋\n\nQuiero info sobre planes y precios 🙂",
      city: "Bogotá",
      modLabel: MOD_LABEL,
    },

    /* ---------- GUIADO ---------- */

    guided: {
      areas: [
        { key: "Música", icon: "🎵" },
        { key: "Danza", icon: "💃" },
        { key: "Artes", icon: "🎨" },
        { key: "Teatro", icon: "🎭" },
      ],
      formatos: [
        { key: "Personalizado", icon: "👤" },
        { key: "Grupal", icon: "👥" },
        { key: "Virtual en vivo", icon: "💻" },
        { key: "Online", icon: "📱" },
      ],
    },

    /* ---------- ACCESO DIRECTO (rail superior) ---------- */

    instrumentos: [
      { key: "Piano", icon: "./assets/instrumentos/piano.png", focus: "piano" },
      { key: "Guitarra", icon: "./assets/instrumentos/guitarra.png", focus: "guitarra" },
      { key: "Canto", icon: "./assets/instrumentos/canto.png", focus: "canto" },
      { key: "Salsa", icon: "./assets/instrumentos/salsa.png", focus: "salsa" },
      { key: "Dibujo", icon: "./assets/instrumentos/dibujo.png", focus: "dibujo" },
      { key: "Teatro", icon: "./assets/instrumentos/teatro.png", focus: "teatro" },
    ],

    /* ---------- PLANES PRINCIPALES ---------- */

    principales: [

      {
        id: "principal_personalizado",
        title: "Personalizado",
        tag: "⭐ Avance rápido",
        bullets: [
          "Ritmo a tu medida",
          "Enfoque personalizado",
          "Ideal para empezar ya",
        ],
        price: "Plan de 4 clases desde $314.000",
        note: "según modalidad",
        media: "./assets/cards/personalizado.png",
        focus: "general",
        modalidades: ["sede", "hogar", "virtual"],
        waPlan: "Personalizado",
        details: {
          title: "Personalizado",
          desc:
            "Ideal si quieres avanzar rápido y con acompañamiento total.",
          include: [
            "Clase 1:1",
            "Plan adaptado a ti",
            "Seguimiento continuo",
          ],
          modalities: ["sede", "hogar", "virtual", "online"],
        },
      },

      {
        id: "principal_grupal",
        title: "Grupal",
        tag: "👥 Más social",
        bullets: [
          "Aprendes con otros",
          "Más accesible",
          "Energía de grupo",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "según grupo",
        media: "./assets/cards/grupal.png",
        focus: "general",
        modalidades: ["sede", "virtual"],
        waPlan: "Grupal",
        details: {
          title: "Grupal",
          desc:
            "Perfecto si te motiva aprender acompañado y con energía colectiva.",
          include: [
            "Clases grupales",
            "Progreso por niveles",
            "Ambiente creativo",
          ],
          modalities: ["sede", "virtual"],
        },
      },

      {
        id: "principal_virtual",
        title: "Virtual en vivo",
        tag: "⚡ Flexible",
        bullets: [
          "Clase en vivo con docente",
          "Desde donde estés",
          "Agenda flexible",
        ],
        price: "Plan de 4 clases desde $282.000",
        note: "clases en vivo",
        media: "./assets/cards/virtual.png",
        focus: "general",
        modalidades: ["virtual"],
        waPlan: "Virtual en vivo",
        details: {
          title: "Virtual en vivo",
          desc:
            "Clase real con docente. Solo cambia el lugar.",
          include: [
            "Sesión en vivo",
            "Material sugerido",
            "Adaptación a tu nivel",
          ],
          modalities: ["virtual"],
        },
      },

      {
        id: "principal_plataforma_online",
        title: "Plataforma Online",
        tag: "💻 Aprende a tu ritmo",
        bullets: [
          "Contenido disponible siempre",
          "Aprende a tu velocidad",
          "Acceso flexible",
        ],
        price: "Plan mensual desde $56.000",
        note: "acceso virtual",
        media: "./assets/cards/online.png",
        focus: "plataforma",
        modalidades: ["online"],
        waPlan: "Plataforma Online",
        details: {
          title: "Plataforma Online Musicala",
          desc:
            "Accede a contenidos y recursos desde cualquier lugar.",
          include: [
            "Videos y recursos",
            "Ruta guiada",
            "Acceso flexible",
          ],
          modalities: ["online"],
        },
      },
    ],

    /* ---------- CATÁLOGO ---------- */

    catalogo: [

      {
        id: "piano_personalizado",
        instrumento: "Piano",
        area: "Música",
        plan: "Personalizado",
        title: "Piano",
        tag: "🎹 Música",
        bullets: [
          "Técnica + canciones",
          "Plan a tu ritmo",
          "Modalidad flexible",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "por clase/mes",
        media: "./assets/planes/piano.png",
        focus: "piano",
        modalidades: ["sede", "hogar", "virtual"],
        details: {
          title: "Piano",
          desc:
            "Arranca desde cero o retoma con una ruta clara.",
          include: [
            "Técnica",
            "Lectura opcional",
            "Repertorio personalizado",
          ],
        },
      },

      {
        id: "guitarra_personalizado",
        instrumento: "Guitarra",
        area: "Música",
        plan: "Personalizado",
        title: "Guitarra",
        tag: "🎸 Música",
        bullets: [
          "Acordes + ritmo",
          "Progreso rápido",
          "Canciones reales",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "por clase/mes",
        media: "./assets/planes/guitarra.png",
        focus: "guitarra",
        modalidades: ["sede", "hogar", "virtual"],
        details: {
          title: "Guitarra",
          desc:
            "Aprendes lo útil primero, sin vueltas.",
          include: [
            "Acordes",
            "Ritmo",
            "Repertorio",
          ],
        },
      },

      {
        id: "canto_personalizado",
        instrumento: "Canto",
        area: "Música",
        plan: "Personalizado",
        title: "Canto",
        tag: "🎤 Música",
        bullets: [
          "Técnica vocal",
          "Respiración",
          "Repertorio personalizado",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "por clase/mes",
        media: "./assets/planes/canto.png",
        focus: "canto",
        modalidades: ["sede", "virtual"],
        details: {
          title: "Canto",
          desc:
            "Cantar con técnica y confianza.",
          include: [
            "Respiración",
            "Técnica",
            "Interpretación",
          ],
        },
      },

      {
        id: "salsa_grupal",
        instrumento: "Salsa",
        area: "Danza",
        plan: "Grupal",
        title: "Salsa",
        tag: "💃 Danza",
        bullets: [
          "Aprende desde cero",
          "Conexión y ritmo",
          "Ambiente bacano",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "mensual",
        media: "./assets/planes/salsa.png",
        focus: "salsa",
        modalidades: ["sede"],
        details: {
          title: "Salsa",
          desc:
            "Plan perfecto para aprender y disfrutar.",
          include: [
            "Bases",
            "Conexión",
            "Figuras",
          ],
        },
      },

      {
        id: "dibujo_grupal",
        instrumento: "Dibujo",
        area: "Artes",
        plan: "Grupal",
        title: "Dibujo",
        tag: "🎨 Artes",
        bullets: [
          "Fundamentos claros",
          "Ejercicios guiados",
          "Proyectos creativos",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "mensual",
        media: "./assets/planes/dibujo.png",
        focus: "dibujo",
        modalidades: ["sede", "virtual"],
        details: {
          title: "Dibujo",
          desc:
            "Fundamentos reales para crear con confianza.",
          include: [
            "Trazos",
            "Forma",
            "Proyectos",
          ],
        },
      },

      {
        id: "teatro_grupal",
        instrumento: "Teatro",
        area: "Teatro",
        plan: "Grupal",
        title: "Teatro",
        tag: "🎭 Teatro",
        bullets: [
          "Expresión",
          "Impro",
          "Montaje escénico",
        ],
        price: "Plan de 4 clases desde $160.000",
        note: "mensual",
        media: "./assets/planes/teatro.png",
        focus: "teatro",
        modalidades: ["sede", "virtual"],
        details: {
          title: "Teatro",
          desc:
            "Para soltar, crear y construir escena.",
          include: [
            "Impro",
            "Montaje",
            "Expresión",
          ],
        },
      },
    ],
  };
})();
