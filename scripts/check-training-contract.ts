/**
 * Verificación del contrato del módulo de entrenamiento.
 *
 * Asigna las 48 respuestas reales del backend (`contract-samples/`, una por operación, generadas
 * por la suite de WP1, WP2 y WP7) a los tipos que declara `trainingAPI`. No se ejecuta: lo que
 * comprueba es el compilador, con `npm run check:training-contract`.
 *
 * Detecta las tres cosas que rompen un panel en silencio:
 *   1. Un campo que el backend manda con otro tipo del que el panel espera —el caso real fue
 *      `load_value: "80.00"`, una cadena donde el editor de días hacía cuentas.
 *   2. Un campo obligatorio en el panel que el backend no manda.
 *   3. Un campo que el backend manda y el panel no declara, que es información perdida.
 *
 * Cuando el backend cambie una forma, este comando se pone rojo antes de que nadie lo descubra
 * con un programa a medio escribir.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  ClientLastPerformance,
  ClientProgramsResponse,
  Exercise,
  ExerciseHistory,
  GymParticipant,
  MyProgramResponse,
  MyTrainingDay,
  PersonalRecord,
  StaffExerciseHistory,
  StaffWorkoutLogSummary,
  StrengthSummaryResponse,
  TrainingAssignResult,
  TrainingBlock,
  TrainingDay,
  TrainingDayNote,
  TrainingDuplicateResult,
  TrainingGroupToday,
  TrainingPreferences,
  TrainingProgram,
  TrainingProgramDetail,
  TrainingProgramListItem,
  TrainingWeek,
  WeightUnit,
  WorkoutLog,
  WorkoutLogSummary,
} from '../src/lib/api'

// --------------------------------------------------------------------------- utilidades de tipos

/**
 * Ensancha los literales de un tipo: `'draft' | 'active'` pasa a `string`.
 *
 * Un JSON importado se tipa con `string`, no con la unión de valores, así que sin esto cada enum
 * daría un falso rojo. Lo que sigue comprobándose es lo que importa: qué campos hay, de qué tipo
 * base son y cuáles pueden ser nulos.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends null
        ? null
        : T extends undefined
          ? undefined
          : T extends readonly (infer U)[]
            ? Widen<U>[]
            : T extends object
              ? { [K in keyof T]: Widen<T[K]> }
              : T

/** `true` si el panel declara todas las claves de la muestra; si no, las que faltan. */
type NoExtraKeys<Sample, Target> = [Exclude<keyof Sample, keyof Target>] extends [never]
  ? true
  : Exclude<keyof Sample, keyof Target>

/**
 * `contract<Tipo>()(muestra, true)`.
 *
 * El primer argumento falla si la forma no encaja; el segundo, si el backend manda campos que el
 * tipo no declara (el error nombra la clave sobrante).
 */
const contract =
  <Target,>() =>
  <S extends Widen<Target>>(_sample: S, _noExtraKeys: NoExtraKeys<S, Target>): void => {}

/** Una respuesta sin cuerpo (204, o el 201 de kudos). `apiCall` la entrega como `{}`. */
type EmptyBody = null

// --------------------------------------------------------------------------- muestras

import assignSample from '../contract-samples/POST_api-v1-training-programs-program_id-assign.json'
import blockCreateSample from '../contract-samples/POST_api-v1-training-programs-program_id-blocks.json'
import blockUpdateSample from '../contract-samples/PUT_api-v1-training-programs-program_id-blocks-block_id.json'
import clientDayNoteSample from '../contract-samples/GET_api-v1-training-clients-user_id-day-notes-note_date.json'
import clientDayNotesSample from '../contract-samples/GET_api-v1-training-clients-user_id-day-notes.json'
import clientHistorySample from '../contract-samples/GET_api-v1-training-clients-user_id-exercises-exercise_key-history.json'
import clientLastPerformanceSample from '../contract-samples/GET_api-v1-training-clients-user_id-exercises-exercise_key-last-performance.json'
import clientLogsSample from '../contract-samples/GET_api-v1-training-clients-user_id-logs.json'
import clientProgramsSample from '../contract-samples/GET_api-v1-training-clients-user_id-programs.json'
import clientRecordsSample from '../contract-samples/GET_api-v1-training-clients-user_id-records.json'
import dayDuplicateSample from '../contract-samples/POST_api-v1-training-programs-program_id-days-day_number-duplicate.json'
import dayNoteUpsertSample from '../contract-samples/PUT_api-v1-training-clients-user_id-day-notes-note_date.json'
import dayUpsertSample from '../contract-samples/PUT_api-v1-training-programs-program_id-days-day_number.json'
import deleteAssignmentSample from '../contract-samples/DELETE_api-v1-training-assignments-assignment_id.json'
import deleteBlockSample from '../contract-samples/DELETE_api-v1-training-programs-program_id-blocks-block_id.json'
import deleteExerciseSample from '../contract-samples/DELETE_api-v1-training-exercises-exercise_id.json'
import deleteProgramSample from '../contract-samples/DELETE_api-v1-training-programs-program_id.json'
import exerciseCreateSample from '../contract-samples/POST_api-v1-training-exercises.json'
import exerciseUpdateSample from '../contract-samples/PUT_api-v1-training-exercises-exercise_id.json'
import exercisesSample from '../contract-samples/GET_api-v1-training-exercises.json'
import groupTodaySample from '../contract-samples/GET_api-v1-training-programs-program_id-group-today.json'
import gymParticipantsSample from '../contract-samples/GET_api-v1-users-gym-participants.json'
import inboxSample from '../contract-samples/GET_api-v1-training-inbox.json'
import kudosSample from '../contract-samples/POST_api-v1-training-logs-log_id-kudos.json'
import logDetailSample from '../contract-samples/GET_api-v1-training-logs-log_id.json'
import logSyncSample from '../contract-samples/POST_api-v1-training-logs-sync.json'
import myDaySample from '../contract-samples/GET_api-v1-training-me-days-day_id.json'
import myHistorySample from '../contract-samples/GET_api-v1-training-me-exercises-exercise_key-history.json'
import myLogsSample from '../contract-samples/GET_api-v1-training-me-logs.json'
import myPreferencesSample from '../contract-samples/GET_api-v1-training-me-preferences.json'
import myProgramSample from '../contract-samples/GET_api-v1-training-me-program.json'
import myRecordsSample from '../contract-samples/GET_api-v1-training-me-records.json'
import myTodaySample from '../contract-samples/GET_api-v1-training-me-today.json'
import myWeekSample from '../contract-samples/GET_api-v1-training-me-week.json'
import preferencesUpdateSample from '../contract-samples/PUT_api-v1-training-me-preferences.json'
import profileSample from '../contract-samples/GET_api-v1-users-profile.json'
import profileUpdateSample from '../contract-samples/PUT_api-v1-users-profile.json'
import programCreateSample from '../contract-samples/POST_api-v1-training-programs.json'
import programDaysSample from '../contract-samples/GET_api-v1-training-programs-program_id-days.json'
import programDetailSample from '../contract-samples/GET_api-v1-training-programs-program_id.json'
import programDuplicateSample from '../contract-samples/POST_api-v1-training-programs-program_id-duplicate.json'
import programPublishSample from '../contract-samples/POST_api-v1-training-programs-program_id-publish.json'
import programUpdateSample from '../contract-samples/PUT_api-v1-training-programs-program_id.json'
import programsSample from '../contract-samples/GET_api-v1-training-programs.json'
import reviewSample from '../contract-samples/POST_api-v1-training-logs-log_id-review.json'
import strengthSummarySample from '../contract-samples/GET_api-v1-training-me-strength-summary.json'
import thankSample from '../contract-samples/POST_api-v1-training-logs-log_id-thank.json'
import weekDuplicateSample from '../contract-samples/POST_api-v1-training-programs-program_id-weeks-week-duplicate.json'

// --------------------------------------------------------------------------- §6.2 · programas

contract<TrainingProgramListItem[]>()(programsSample, true)
contract<TrainingProgramListItem>()(programsSample[0], true)
contract<TrainingProgramDetail>()(programDetailSample, true)
contract<TrainingBlock>()(programDetailSample.blocks[0], true)
contract<TrainingProgram>()(programCreateSample, true)
contract<TrainingProgram>()(programUpdateSample, true)
contract<TrainingProgram>()(programDuplicateSample, true)
contract<TrainingProgram>()(programPublishSample, true)
const _deleteProgram: EmptyBody = deleteProgramSample

// --------------------------------------------------------------------------- §6.2 · bloques

contract<TrainingBlock>()(blockCreateSample, true)
contract<TrainingBlock>()(blockUpdateSample, true)
const _deleteBlock: EmptyBody = deleteBlockSample

// --------------------------------------------------------------------------- §6.2 · días

contract<TrainingDay[]>()(programDaysSample, true)
contract<TrainingDay>()(programDaysSample[0], true)
contract<TrainingDay>()(dayUpsertSample, true)
contract<TrainingDuplicateResult>()(weekDuplicateSample, true)
contract<TrainingDuplicateResult>()(dayDuplicateSample, true)

// --------------------------------------------------------------------------- §6.2 · asignación

contract<TrainingAssignResult>()(assignSample, true)
const _deleteAssignment: EmptyBody = deleteAssignmentSample

// --------------------------------------------------------------------------- §6.2 · ficha

contract<ClientProgramsResponse>()(clientProgramsSample, true)
contract<StaffWorkoutLogSummary[]>()(clientLogsSample, true)
contract<StaffWorkoutLogSummary>()(clientLogsSample[0], true)
contract<PersonalRecord[]>()(clientRecordsSample, true)
contract<PersonalRecord>()(clientRecordsSample[0], true)
contract<StaffExerciseHistory>()(clientHistorySample, true)
contract<ClientLastPerformance>()(clientLastPerformanceSample, true)

// --------------------------------------------------------------------------- §6.2 · revisión y notas

contract<WorkoutLog>()(reviewSample, true)
contract<TrainingDayNote>()(clientDayNoteSample, true)
contract<TrainingDayNote[]>()(clientDayNotesSample, true)
contract<TrainingDayNote>()(dayNoteUpsertSample, true)
contract<StaffWorkoutLogSummary[]>()(inboxSample, true)
contract<StaffWorkoutLogSummary>()(inboxSample[0], true)

// --------------------------------------------------------------------------- §6.2 · catálogo

contract<Exercise[]>()(exercisesSample, true)
contract<Exercise>()(exerciseCreateSample, true)
contract<Exercise>()(exerciseUpdateSample, true)
const _deleteExercise: EmptyBody = deleteExerciseSample

// --------------------------------------------------------------------------- §6.1 · cliente

contract<MyProgramResponse>()(myProgramSample, true)
contract<TrainingWeek>()(myWeekSample, true)
contract<MyTrainingDay>()(myDaySample, true)
contract<MyTrainingDay>()(myTodaySample, true)
contract<WorkoutLog>()(logSyncSample, true)
contract<WorkoutLogSummary[]>()(myLogsSample, true)
contract<WorkoutLogSummary>()(myLogsSample[0], true)
contract<WorkoutLog>()(logDetailSample, true)
contract<ExerciseHistory>()(myHistorySample, true)
contract<PersonalRecord[]>()(myRecordsSample, true)
contract<StrengthSummaryResponse>()(strengthSummarySample, true)
contract<TrainingPreferences>()(myPreferencesSample, true)
contract<TrainingPreferences>()(preferencesUpdateSample, true)
contract<TrainingGroupToday>()(groupTodaySample, true)
const _thank: EmptyBody = thankSample
const _kudos: EmptyBody = kudosSample

// --------------------------------------------------------------------------- fuera de /training

/**
 * De los participantes, el módulo consume la identidad y la unidad de peso: es lo que alimenta el
 * modal de asignación y el panel del cliente.
 *
 * El resto de `GymParticipant` no se verifica aquí. El backend manda `null` en `phone_number`,
 * `birth_date`, `height`, `weight`, `bio`, `goals`, `health_conditions`, `qr_code` y `picture`,
 * mientras que el tipo del repositorio los declara `?: string` (opcional, pero no nulo). Es un
 * desajuste anterior a este módulo y de otro paquete: queda anotado en el informe, no tocado.
 */
type ParticipantForTraining = Pick<
  GymParticipant,
  'id' | 'email' | 'first_name' | 'last_name' | 'role' | 'gym_role' | 'preferred_weight_unit'
>
const participant = gymParticipantsSample[0]
contract<ParticipantForTraining>()(
  {
    id: participant.id,
    email: participant.email,
    first_name: participant.first_name,
    last_name: participant.last_name,
    role: participant.role,
    gym_role: participant.gym_role,
    preferred_weight_unit: participant.preferred_weight_unit,
  },
  true,
)

/**
 * Del perfil propio, el módulo sólo consume la unidad de peso. El resto de `/users/profile` es de
 * otro paquete y no se verifica aquí para no atar este chequeo a tipos ajenos.
 */
type ProfileWeightUnit = { preferred_weight_unit: WeightUnit | null }
contract<ProfileWeightUnit>()({ preferred_weight_unit: profileSample.preferred_weight_unit }, true)
contract<ProfileWeightUnit>()(
  { preferred_weight_unit: profileUpdateSample.preferred_weight_unit },
  true,
)
