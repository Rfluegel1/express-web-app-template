# typescript-template

This project is designed to be a starting point for a typescript web application

```npm install```

## Run Front End Locally

```node server.js```

## Run unit tests

```npm test```

## Run backend

```npm run dev```

## Manually test backend responses

1. ```brew install insomnia```
2. import from file ```insomnia-config.json```

## Run end-2-end tests

1. ```npx cypress open```

## Configure WebStorm

### To match formatter

1. Preferences | Editor | Code Style | TypeScript | Punctuation
2. From the drop-downs, select "Don't use", "always", "single", "always", and "keep"

### To format on save

Record the macro

1. Edit | Macros | Start Macro recording
2. Press Cmd+Option+L, and then Cmd+Option+S (on Windows: Ctrl+Alt+L, and then Ctrl+Alt+S)
3. Stop recording the macro clicking on the Stop button on the bottom right of the page
4. Give this macro a name like "Format and Save"

Assign Ctrl+S to "Format and Save"

1. File | Settings
2. search for "keymap" and open it
3. search "Format and Save" and double-click the action "Format and Save"
4. select "Add Keyboard Shortcut"
5. select "Ctrl+S" as first stroke.
6. it will report conflicts. Ignore it and click OK button
7. WebStorm will show a warning "The shortcut is already assigned to other actions. Do you want to remove other
   assignments?" Click "Remove" button