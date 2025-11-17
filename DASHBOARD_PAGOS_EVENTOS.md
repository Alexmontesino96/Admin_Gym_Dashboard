# 💳 Dashboard de Pagos de Eventos - Guía de Acceso

## 📍 Ubicación en el Menú

El Dashboard de Pagos ahora está disponible como un **submenú desplegable** dentro de la sección "Eventos" en el menú lateral.

## 🚀 Cómo Acceder

### Opción 1: Desde el Menú Lateral

1. **Navega a "Eventos"** en el menú lateral izquierdo
2. El menú se **expandirá automáticamente** mostrando 2 opciones:
   - 📅 **Ver Eventos**: Lista principal de eventos
   - 💰 **Dashboard de Pagos**: Panel administrativo de pagos
3. Haz clic en **"Dashboard de Pagos"**

### Opción 2: URL Directa

Navega directamente a: `/eventos/admin/payments`

## 🎯 Características del Menú Desplegable

- **Auto-expansión**: El menú de Eventos se expande automáticamente cuando navegas a cualquier ruta bajo `/eventos`
- **Indicador visual**: La flecha rota 90° cuando el menú está expandido
- **Persistencia**: El menú permanece expandido mientras estés en cualquier página de eventos
- **Responsive**: Funciona tanto en desktop como en móvil

## 📊 Lo que encontrarás en el Dashboard

### Estadísticas Globales (6 métricas)
- 💵 **Ingresos Totales**: Total recaudado de todos los eventos
- 📅 **Eventos de Pago**: Número de eventos activos con precio
- ✅ **Pagos Completados**: Total de participantes que han pagado
- ⏳ **Pagos Pendientes**: Participantes con pago pendiente
- 💸 **Reembolsado**: Total de dinero reembolsado
- 📈 **Precio Promedio**: Precio promedio por ticket

### Panel Principal (2 columnas)
- **Columna izquierda**: Lista de eventos con pagos
- **Columna derecha**: Detalles del evento seleccionado

### Funcionalidades Administrativas
- 🔄 Procesar reembolsos manuales
- ✅ Marcar pagos como completados (para pagos en efectivo)
- 📥 Exportar datos a CSV
- 🔍 Filtrar por estado de pago

## 🎨 Diseño Visual

El menú de Eventos ahora tiene:
- **Icono principal**: 📅 (Calendar)
- **Submenús con iconos**:
  - Ver Eventos: 📆 (CalendarDays)
  - Dashboard de Pagos: 💰 (DollarSign)

## 💡 Tips de Uso

1. **Filtros activos**: Por defecto muestra solo eventos activos
2. **Selección de evento**: Haz clic en cualquier evento de la lista izquierda para ver sus detalles
3. **Exportación**: El botón de exportar CSV aparece cuando seleccionas un evento
4. **Estados de pago**: Puedes filtrar por PENDING, PAID, REFUNDED, CREDITED, EXPIRED

## 🔧 Requisitos

Para que el dashboard funcione correctamente necesitas:
1. ✅ Backend con endpoints de pagos implementados
2. ✅ Stripe configurado en el gimnasio
3. ✅ Al menos un evento de pago creado

## 🚦 Estados de Pago

- 🟡 **PENDING**: Pago pendiente
- 🟢 **PAID**: Pago completado
- 🔵 **REFUNDED**: Reembolsado
- 🟣 **CREDITED**: Crédito otorgado
- 🔴 **EXPIRED**: Plazo de pago expirado

---

¡El Dashboard de Pagos está listo para usar! Navega a **Eventos → Dashboard de Pagos** para comenzar.