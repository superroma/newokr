Uncaught error in new emty app

Command validation

Command inserted into every event:

```
    return {
      ...command,
```

Event names are duplicated

Highly unreadable and not unmaintainable code:

```
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
```
aggregate projection code mutates state. It doesn't in view model

