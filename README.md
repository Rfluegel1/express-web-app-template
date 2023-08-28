# typescript-template

This project is designed to be a starting point for a typescript web application with unit, integration, blackbox, e2e,
and performance testing. There is also github action files for continuous integration and deployment, and dependency
updates.

```npm install```

## Run front end

``` npm run frontend ```

## Create static web pages for backend

```npm run build```

## Run backend

```npm run backend```

## Run backend and frontend

```npm run fullstack```

## Run database

1. ```brew services start postgresql@14```
2. ```npm run migrations```

### To roll back a bad migration

```npm run migrations:revert```

#### Install postgresql@14

1. ```brew install postgresql@14```
2. ```createdb post```

note*:
brew does not create a database folder for postgresql@14
which may lead to errors starting the service with brew
or interacting in general. Consider checking error logs.
These are the steps I had to complete on macOS to make brew play nicely

1. navigate to /opt/homebrew/var
2. ``mkdir postgresql@14``

## Run unit and blackbox tests

```npm run test```

### Run tests as they are in github actions

```npm run test:github```

note*: make sure port 8080 is available

## Run end-to-end tests

### Open cypress application

```npm run cypress```

### Start fullstack and run headless

```npm run e2e```

note*: make sure port 8080 and 3000 are available

## Run performance tests

1. ```brew install k6```
2. ```k6 run tests/postPerformance.ts```

## Manually test backend responses

1. ```brew install insomnia```
2. import from file ```insomnia-config.json```

## Remove node modules and cache

```npm run clean```

## Deploy to staging environment

### First time

1. ```brew install flyctl```
2. ```flyctl login```

### Every time

1. ```npm run build```
2. ```flylctl deploy```

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

### To run backend in debug mode

1. Run | Edit Configurations...
2. Create a new Node.js configuration
3. Rename to 'Debug Server'
4. Change the interpreter to ts-node (~/workspaces/typescript-template/node_modules/.bin/ts-node)
5. Set working directory to ~/workspaces/typescript-template
6. Set Javascript file to src/backend/server.ts