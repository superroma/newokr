const commands = {
  createObjective(state, command) {
    const { title, period } = command.payload

    if (state.aggregateId === command.aggregateId) {
      throw new Error('AggregateId is already used')
    }
    if (!title) {
      throw new Error('Title is required')
    }

    const objectiveLinkField = command.payload.userId ? 'userId' : 'orgUnitId'
    return {
      ...command,
      type: 'ObjectiveCreated',
      payload: {
        title,
        period,
        [objectiveLinkField]: command.payload[objectiveLinkField]
      }
    }
  },
  changeTitle(state, command) {
    const { title } = command.payload

    if (!title) {
      throw new Error('Title is required')
    }
    if (title === state.title) {
      throw new Error('Title should be changed')
    }

    return {
      ...command,
      type: 'ObjectiveTitleChanged',
      payload: {
        title
      }
    }
  },
  changeTimePeriod(state, command) {
    const { period } = command.payload

    if (period === state.period) {
      throw new Error('TimePeriod should be changed')
    }

    return {
      ...command,
      type: 'ObjectivePeriodChanged',
      payload: {
        period
      }
    }
  },
  deleteObjective(state, command) {
    if (state.isDeleted) {
      throw new Error('Objective should not be deleted')
    }

    return {
      ...command,
      type: 'ObjectiveDeleted'
    }
  },
  restoreObjective(state, command) {
    if (!state.isDeleted) {
      throw new Error('Objective should be deleted')
    }

    return {
      ...command,
      type: 'ObjectiveRestored'
    }
  },
  addKeyResult(state, command) {
    const { keyResultId, title } = command.payload

    if (!title) {
      throw new Error('Title is required')
    }
    if (!keyResultId) {
      throw new Error('KeyResultId is required')
    }
    if (Object.keys(state.keyResults).includes(keyResultId)) {
      throw new Error('KeyResult was already added')
    }

    return {
      ...command,
      type: 'KeyResultAdded',
      payload: {
        title,
        keyResultId
      }
    }
  },
  updateKeyResult(state, command) {
    const { keyResultId, title, progress } = command.payload

    if (!title) {
      throw new Error('Title is required')
    }
    if (!Object.keys(state.keyResults).includes(keyResultId)) {
      throw new Error('KeyResult does not exist')
    }

    const sameTitle = title === state.keyResults[keyResultId].title
    const samePeriod = progress === state.keyResults[keyResultId].progress

    if (sameTitle && samePeriod) {
      throw new Error('Title or progress should be changed')
    }

    return {
      ...command,
      type: 'KeyResultUpdated',
      payload: {
        title,
        progress,
        keyResultId
      }
    }
  },
  deleteKeyResult(state, command) {
    const { keyResultId } = command.payload

    if (state.keyResults[keyResultId].isDeleted) {
      throw new Error('KeyResult should not be deleted')
    }

    return {
      ...command,
      type: 'KeyResultDeleted',
      payload: {
        keyResultId
      }
    }
  },
  restoreKeyResult(state, command) {
    const { keyResultId } = command.payload

    if (!state.keyResults[keyResultId].isDeleted) {
      throw new Error('KeyResult should be deleted')
    }

    return {
      ...command,
      type: 'KeyResultRestored',
      payload: {
        keyResultId
      }
    }
  }
}

const commandTypes = {
  changeOrder: 'ObjectiveOrderChanged',
  changeKeyResultsOrder: 'KeyResultsOrderChanged',
  createTimePeriod: 'TimePeriodCreated',
  updateTimePeriod: 'TimePeriodUpdated',
  deleteTimePeriod: 'TimePeriodDeleted'
}

Object.keys(commandTypes).forEach(name => {
  const type = commandTypes[name]
  commands[name] = (_, args) => ({
    ...args,
    type
  })
})

const projection = {
  ObjectiveCreated: (_, { aggregateId, payload: { title, period } }) => ({
    aggregateId,
    title: title || 'New Objective',
    keyResults: {},
    isDeleted: false,
    period
  }),

  ObjectiveTitleChanged: (state, { payload: { title } }) => {
    state.title = title
    return state
  },

  ObjectivePeriodChanged: (state, { payload: { period } }) => {
    state.period = period
    return state
  },

  ObjectiveDeleted: state => {
    state.isDeleted = true
    return state
  },

  ObjectiveRestored: state => {
    delete state.isDeleted
    return state
  },

  KeyResultAdded: (state, { payload: { keyResultId, title, progress } }) => {
    state.keyResults[keyResultId] = {
      title: title || 'New key',
      progress: progress || 0
    }

    return state
  },

  KeyResultUpdated: (state, { payload: { keyResultId, title, progress } }) => {
    const keyResult = state.keyResults[keyResultId]

    if (title) {
      keyResult.title = title
    }

    if (progress !== undefined) {
      keyResult.progress = progress
    }

    return state
  },

  KeyResultDeleted: (state, { payload: { keyResultId } }) => {
    const keyResult = state.keyResults[keyResultId]
    keyResult.isDeleted = true
    return state
  },

  KeyResultRestored: (state, { payload: { keyResultId } }) => {
    const keyResult = state.keyResults[keyResultId]
    delete keyResult.isDeleted
    return state
  }
}

export default {
  name: 'objective',
  initialState: {},
  projection,
  commands
}
