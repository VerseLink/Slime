class CachedByteToHex {
    
    readonly length = 0x100;
    
    convert: string[] = [];

    init() {
        if (this.convert.length !== 0)
            return;
        this.convert = new Array(this.length);
        let char = String.fromCharCode;
        let n = 0;
        for (; n < 0x0a; ++n) this.convert[n] = '0' + n;
        for (; n < 0x10; ++n) this.convert[n] = '0' + char(n + 87);
        for (; n < this.length; ++n) this.convert[n] = n.toString(16);
    }
}

export const byteToHex = new CachedByteToHex();