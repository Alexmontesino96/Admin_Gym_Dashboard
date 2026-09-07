# Muestras del contrato del backend

48 respuestas JSON reales, una por operación, generadas por la suite del backend (WP1, WP2 y WP7)
y copiadas aquí desde `PLAN_MODULO_ENTRENAMIENTO_REPORTES/contract-samples/`.

`scripts/check-training-contract.ts` las asigna a los tipos de `trainingAPI`, de modo que
`npm run check:training-contract` falla si el backend manda un campo que el panel no declara, o lo
manda con otro tipo. Viven dentro del repositorio a propósito: un chequeo de contrato que depende
de una ruta del portátil de alguien no lo puede ejecutar nadie más.

Para actualizarlas, vuelve a copiarlas desde el informe del backend y ejecuta el chequeo.
