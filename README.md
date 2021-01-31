# Electron Module Manager

A simple implementation of windows/modules management for React-based Electron application.

## Installation

- Add package as dependency:

```bash
npm install electron-module-manager
```

- Create an enum with list of your **module types**:

```typescript
export const enum ModuleType {
    COUNTER
}

```

- Create an interface with the **module state** (_optional_):

```typescript
export interface CounterModuleState {
    counter:number;
}
```

- Create an interface with the **module context** (_optional_):

```typescript
export interface CounterModuleContext {
    increaseValue():Promise<void>;
}
```

- Create **module class**, extending base _Module_ class and implementing **module context** interface:

```typescript
export class CounterModule extends Module<ModuleType, CounterModuleState> implements CounterModuleContext {
    public constructor() {
        super(ModuleType.COUNTER);

        // setting up initial module state

        this._state = {
            counter: 0
        };
    }

    public async increaseValue():Promise<void> {
        // updating module state and notifying module view

        this._application.updateState(
            this._moduleType, { counter: this._state.counter + 1 }, true
        );
    }

    public get windowOptions():Partial<WindowOptions<ModuleType>> {
        // providing initial state for window view

        return {
            moduleTitle: 'Counter',
            width: 250,
            height: 250
        };
    }
}
```

- Create **module view class**, extending base _ModuleView_ class:

```typescript jsx
export class CounterModuleView extends ModuleView<ModuleType, CounterModuleState, CounterModuleContext> {
    private _updatesCount:number = 0;

    private increaseCounterValue = async () => {
        this._updatesCount++;
        await this._context.increaseValue();
    };

    public componentDidMount() {
        setInterval(this.increaseCounterValue, 1000);
    }

    public render():React.ReactNode {
        return (
            <div className="counter">
                <div>Current window <strong>counter</strong>: { this._updatesCount }</div>
                <div>Global <strong>counter</strong>: { this.state.counter }</div>
            </div>
        );
    }
}
```

- Create **entry points** (application, preload & window scrips):

```typescript
// application.ts - binding module type with module class

const application = new Application(
    'window.html', 'window.bridge.js', {
        [ModuleType.COUNTER]: CounterModule
    }
);

Electron.app.on('ready', async () => {
    await application.createWindowParent(
        ModuleType.COUNTER
    );
});
```

```typescript
// window.bridge.js - exposing main process API to renderer 

WindowBridgeProcessWorker.createBridge();
```

```typescript
// window.js - binding module type with module view class

WindowProcessWorker.createWindow(
    WindowView, '#application', {
        [ModuleType.COUNTER]: CounterModuleView
    }
);
```

## Example

Example application could be found [here](https://github.com/dmn-chumak/electron-module-manager/tree/master/example).
