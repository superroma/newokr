import Immutable from 'seamless-immutable'

const calculateObjectiveProgress = keyResults => {
  const existingKeyResults = keyResults.filter(
    keyResult => !keyResult.isDeleted
  )

  const keyResultsProgress = existingKeyResults.reduce(
    (result, keyResult) => result + keyResult.progress,
    0
  )

  const result =
    existingKeyResults.length === 0
      ? 0
      : keyResultsProgress / existingKeyResults.length

  return Math.round(result)
}

export default {
  name: 'objective',
  projection: {
    ObjectiveCreated: (
      _,
      { aggregateId, payload: { title, period, orgUnitId, userId } }
    ) => {
      const basePart = userId ? { userId } : { orgUnitId }

      return Immutable({
        ...basePart,
        id: aggregateId,
        title: title || 'New Objective',
        period,
        keyResults: [],
        progress: 0
      })
    },

    ObjectiveTitleChanged: (state, { payload: { title } }) =>
      state.set('title', title),

    ObjectivePeriodChanged: (state, { payload: { period } }) =>
      state.set('period', period),

    ObjectiveDeleted: state => state.set('isDeleted', true),

    ObjectiveRestored: state => state.without('isDeleted'),

    KeyResultAdded: (state, { payload: { keyResultId, title, progress } }) => {
      const newState = state.update('keyResults', keyResults =>
        keyResults.concat({
          id: keyResultId,
          title: title || 'New key',
          progress: progress || 0
        })
      )

      return newState.set(
        'progress',
        calculateObjectiveProgress(newState.keyResults)
      )
    },

    KeyResultUpdated: (
      state,
      { payload: { keyResultId, title, progress } }
    ) => {
      if (title === undefined && progress === undefined) {
        return state
      }

      const fieldToUpdate = {}

      if (title) {
        fieldToUpdate.title = title
      }

      const isProgressChanged = typeof progress === 'number'

      if (isProgressChanged) {
        fieldToUpdate.progress = progress
      }

      let newState = state.update('keyResults', keyResults =>
        keyResults.map(
          keyResult =>
            keyResult.id === keyResultId
              ? keyResult.merge(fieldToUpdate)
              : keyResult
        )
      )

      if (isProgressChanged) {
        newState = newState.set(
          'progress',
          calculateObjectiveProgress(newState.keyResults)
        )
      }

      return newState
    },

    KeyResultDeleted: (state, { payload: { keyResultId } }) => {
      const newState = state.update('keyResults', keyResults =>
        keyResults.map(
          keyResult =>
            keyResult.id === keyResultId
              ? keyResult.set('isDeleted', true)
              : keyResult
        )
      )

      return newState.set(
        'progress',
        calculateObjectiveProgress(newState.keyResults)
      )
    },

    KeyResultRestored: (state, { payload: { keyResultId } }) => {
      const newState = state.update('keyResults', keyResults =>
        keyResults.map(
          keyResult =>
            keyResult.id === keyResultId
              ? keyResult.without('isDeleted', true)
              : keyResult
        )
      )

      return newState.set(
        'progress',
        calculateObjectiveProgress(newState.keyResults)
      )
    }
  },
  serializeState: state => JSON.stringify(state || {}),
  deserializeState: state => Immutable(JSON.parse(state))
}
