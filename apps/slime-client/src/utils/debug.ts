class Debug {
    
    get enabled() {
        return import.meta.env.DEV;
    }

    info(...args: any[]) {
        this.enabled && console.info(...args);
    }

    debug(...args: any[]) {
        this.enabled && console.debug(...args);
    }

    log(...args: any[]) {
        this.enabled && console.log(...args);
    }

    warn(...args: any[]) {
        this.enabled && console.warn(...args);
    }

    error(...args: any[]) {
        this.enabled && console.error(...args);
    }
    
    trace(...args: any[]) {
        this.enabled && console.trace(...args);
    }


}

export const debug = new Debug();